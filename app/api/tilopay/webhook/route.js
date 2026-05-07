import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const body = await req.json();
    
    const rawOrderId = body.order || body.orderId;
    
    if (rawOrderId && (body.status === 'APPROVED' || body.status === 1 || body.status === 'Success')) {
      // Tilopay often appends prefixes like "PFC026822-", we need to strip it if present to match our DB UUID
      const orderId = rawOrderId.includes('-') && rawOrderId.split('-').length === 2 
          ? rawOrderId.split('-')[1] // Extracts the 5f61e1609c... part if prefix is present
          : rawOrderId;

      // Ensure we find the order by checking if our DB UUID without dashes matches the incoming orderId
      // Or just find by ID if it matches exactly. Since we stripped dashes when sending to Tilopay, we might need a custom query
      const orders = await prisma.order.findMany();
      const order = orders.find(o => o.id.replace(/-/g, '').includes(orderId) || orderId.includes(o.id.replace(/-/g, '')));

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'APPROVED' }
        });
        
        // Trigger email on successful payment
        sendOrderConfirmationEmail(order).catch(err => console.error("Webhook Email error:", err));
      }
      
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
