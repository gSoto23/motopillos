"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function updateOrderStatus(orderId, newStatus) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });
    
    // Si quisieras enviar un email de "Orden Enviada" o similar, podrías hacerlo aquí
    
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
}

export async function markOrderAsPurchased(orderId, supplierDetails) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'PURCHASED',
        supplierDetails: supplierDetails
      }
    });
    
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error("Error marking order as purchased:", error);
    return { success: false, error: error.message };
  }
}

export async function syncTilopayOrder(orderId) {
  try {
    const authPayload = {
      apiuser: process.env.TILOPAY_USER,
      password: process.env.TILOPAY_PASSWORD
    };
    
    // 1. Get Token
    const loginRes = await fetch(`${process.env.TILOPAY_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authPayload)
    });
    
    if (!loginRes.ok) throw new Error("Failed to authenticate with Tilopay");
    
    const loginData = await loginRes.json();
    const token = loginData.access_token || loginData.token;
    if (!token) throw new Error("Tilopay token not received");

    // 2. Consult Order (Standard and Prefixed)
    const truncatedOrderId = orderId.replace(/-/g, '').substring(0, 30);
    
    // We try the standard one first, then the PFC026822 prefix which Tilopay adds automatically
    const orderNumbersToTry = [
      truncatedOrderId,
      `PFC026822-${truncatedOrderId}`
    ];

    let statusUpdated = false;
    let finalData = null;

    for (const onum of orderNumbersToTry) {
      console.log("TRYING TILOPAY CONSULT WITH:", onum);
      const consultPayload = {
        key: process.env.TILOPAY_KEY,
        orderNumber: onum
      };

      const consultRes = await fetch(`${process.env.TILOPAY_API_URL}/consult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(consultPayload)
      });

      if (consultRes.ok) {
        const consultData = await consultRes.json();
        console.log("RESPONSE FOR", onum, ":", consultData);
        
        // Extract the actual transaction from the response array if present
        const tx = (Array.isArray(consultData.response) && consultData.response.length > 0) 
          ? consultData.response[0] 
          : consultData;
        
        if (tx.status === 'APPROVED' || tx.status === 1 || tx.code === '1' || tx.response?.toLowerCase().includes('aprobada') || tx.description?.toLowerCase().includes('aprobada')) {
          const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'APPROVED' }
          });
          
          // Enviar correo de confirmación ya que se aprobó exitosamente y el webhook no lo hizo
          sendOrderConfirmationEmail(updatedOrder).catch(err => console.error("Sync Email error:", err));
          
          statusUpdated = true;
          finalData = tx;
          break; // Found it!
        }
      }
    }

    revalidatePath('/admin/orders');
    return { success: true, statusUpdated, tilopayData: finalData };

  } catch (error) {
    console.error("Error syncing with Tilopay:", error);
    return { success: false, error: error.message };
  }
}
