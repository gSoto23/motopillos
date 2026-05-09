"use server";
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendWelcomeEmail, sendAdminNewOrderEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

function generateRandomPassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < length; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

export async function verifyCartInventory(cartItems) {
  const normalizedCartItems = cartItems.map(item => ({
    ...item,
    partNumber: item.partNumber || item.partNo
  }));
  
  const skusData = normalizedCartItems.map(item => {
    let brand = null;
    if (item.meta && typeof item.meta === 'string') {
      const firstWord = item.meta.split(' ')[0].toLowerCase();
      const knownBrands = ['yamaha', 'honda', 'kawasaki', 'suzuki', 'polaris', 'arctic-cat', 'can-am', 'sea-doo', 'ski-doo', 'harley-davidson'];
      if (knownBrands.includes(firstWord)) {
        brand = firstWord;
      }
    }
    return {
      sku: item.partNumber,
      brand: brand
    };
  }).filter(i => i.sku);
  
  const skus = skusData.map(i => i.sku);
  
  const validatedItems = [];
  const outOfStockItems = [];

  if (skus.length === 0) {
    return { success: true, validatedItems: normalizedCartItems, outOfStockItems: [] };
  }

  try {
    // Determine python executable based on environment (local venv vs production)
    const pythonPath = process.env.NODE_ENV === 'production' ? 'python3' : './venv/bin/python3';
    
    // Maintain the '999' dummy trigger for frontend testing without hitting the scraper
    const dummyOos = normalizedCartItems.filter(i => i.partNumber && i.partNumber.endsWith('999'));
    if (dummyOos.length > 0) {
      dummyOos.forEach(item => outOfStockItems.push(item));
      normalizedCartItems.forEach(item => {
        if (!item.partNumber || !item.partNumber.endsWith('999')) {
          validatedItems.push(item);
        }
      });
      return {
        success: false,
        validatedItems,
        outOfStockItems,
        message: "Algunas piezas ya no están disponibles en bodega."
      };
    }

    // Escape JSON string for bash command line
    const jsonSkus = JSON.stringify(skusData).replace(/'/g, "'\\''");
    
    const { stdout } = await execPromise(`${pythonPath} scraper/verify_cart_bulk.py '${jsonSkus}'`);
    const response = JSON.parse(stdout);
    
    if (response.success && response.results) {
      for (const item of normalizedCartItems) {
        if (!item.partNumber) {
           validatedItems.push(item);
           continue;
        }
        const isAvailable = response.results[item.partNumber];
        if (isAvailable) {
          validatedItems.push(item);
        } else {
          outOfStockItems.push(item);
        }
      }
    } else {
      throw new Error(response.error || "Unknown python script error");
    }

  } catch (error) {
    console.error("JIT Verification Error:", error);
    // Failsafe: Si falla el scraping (bloqueo, timeout), aprobamos para no perder la venta en el MVP.
    return {
      success: true,
      validatedItems: normalizedCartItems,
      outOfStockItems: [],
      message: "Inventario confirmado (failsafe)."
    };
  }
  
  return {
    success: outOfStockItems.length === 0,
    validatedItems,
    outOfStockItems,
    message: outOfStockItems.length > 0 
      ? "Algunas piezas ya no están disponibles en bodega." 
      : "Inventario confirmado."
  };
}

export async function createOrder(orderData) {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, totalAmount, paymentMethod, itemsList } = orderData;
    
    // All start as PENDING. TARJETA will be approved via Webhook.
    const initialStatus = 'PENDING';

    let user = await prisma.user.findUnique({ where: { email: customerEmail } });
    let newPassword = null;

    if (!user) {
      newPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user = await prisma.user.create({
        data: {
          email: customerEmail,
          password: hashedPassword,
          name: customerName,
          phone: customerPhone,
          address: shippingAddress,
          role: 'USER'
        }
      });
      // Enviar email de bienvenida de forma asíncrona
      sendWelcomeEmail(user, newPassword).catch(err => console.error("Welcome email error:", err));
    }

    const order = await prisma.order.create({
      data: {
         customerName,
         customerEmail,
         customerPhone,
         shippingAddress,
         totalAmount,
         paymentMethod,
         status: initialStatus,
         itemsList: JSON.stringify(itemsList),
         userId: user.id
      }
    });

    // Send confirmation email asynchronously only for offline methods
    // For TARJETA, the email is sent from the webhook upon successful payment
    if (paymentMethod !== 'TARJETA') {
      sendOrderConfirmationEmail(order).catch(err => console.error("Email error:", err));
    }

    // Send admin notification
    sendAdminNewOrderEmail(order).catch(err => console.error("Admin Email error:", err));

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order in database.' };
  }
}

export async function cancelOrder(orderId) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    });
    return { success: true };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: error.message };
  }
}
