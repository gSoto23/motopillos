"use server";
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function verifyCartInventory(cartItems) {
  // Silent Server-Side JIT Verification.
  // The user sees a standard loading spinner, while we secretly ping our supplier.
  
  // Simulated delay for the supplier ping (e.g. Playwright or HTTP request)
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  const validatedItems = [];
  const outOfStockItems = [];
  
  // For the MVP demo, we will approve everything except occasionally rejecting
  // if an item partNumber ends exactly with '999' (dummy trigger).
  // Everything else is approved to keep the checkout smooth.
  
  for (const item of cartItems) {
    if (item.partNumber && item.partNumber.endsWith('999')) {
      outOfStockItems.push(item);
    } else {
      validatedItems.push(item);
    }
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

    const order = await prisma.order.create({
      data: {
         customerName,
         customerEmail,
         customerPhone,
         shippingAddress,
         totalAmount,
         paymentMethod,
         status: initialStatus,
         itemsList: JSON.stringify(itemsList)
      }
    });

    // Send confirmation email asynchronously only for offline methods
    // For TARJETA, the email is sent from the webhook upon successful payment
    if (paymentMethod !== 'TARJETA') {
      sendOrderConfirmationEmail(order).catch(err => console.error("Email error:", err));
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order in database.' };
  }
}
