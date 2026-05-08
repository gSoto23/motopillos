import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function sendOrderConfirmationEmail(order) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  let exchangeRate = 515;
  let baseShippingCost = 0;
  try {
    const configRecord = await prisma.config.findUnique({ where: { key: 'adminConfig' } });
    if (configRecord && configRecord.value) {
      const adminConfig = JSON.parse(configRecord.value);
      if (adminConfig.exchangeRate) exchangeRate = adminConfig.exchangeRate;
      if (adminConfig.baseShippingCost) baseShippingCost = adminConfig.baseShippingCost;
    }
  } catch (e) {
    console.error("Error fetching admin config for email:", e);
  }

  const parsedItems = typeof order.itemsList === 'string' ? JSON.parse(order.itemsList) : order.itemsList;
  
  let subtotalUSD = 0;
  parsedItems.forEach(item => {
    subtotalUSD += item.price * item.qty;
  });
  const ivaUSD = subtotalUSD * 0.13;
  const shippingUSD = Math.max(0, order.totalAmount - subtotalUSD - ivaUSD);

  const itemsHtml = parsedItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">
        ₡${((item.priceCRC || (item.price * exchangeRate)) * item.qty).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
      </td>
    </tr>
  `).join('');

  let paymentInstructions = '';
  if (order.paymentMethod === 'SINPE') {
    paymentInstructions = `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Instrucciones para pago por SINPE Móvil</h3>
        <p>Tu orden está <strong>PENDIENTE</strong> de pago. Por favor realiza el SINPE por el monto total a:</p>
        <p><strong>Teléfono:</strong> 8888-8888</p>
        <p>Asegúrate de enviar el comprobante e incluir el ID de tu orden en el detalle del pago.</p>
      </div>
    `;
  } else if (order.paymentMethod === 'TRANSFERENCIA') {
    paymentInstructions = `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Instrucciones para Transferencia Bancaria</h3>
        <p>Tu orden está <strong>PENDIENTE</strong> de pago. Por favor deposita a la siguiente cuenta:</p>
        <p><strong>Cuenta:</strong> CR12015201001234567890</p>
        <p>Asegúrate de enviar el comprobante e incluir el ID de tu orden en el detalle del pago.</p>
      </div>
    `;
  } else {
    paymentInstructions = `
      <div style="background-color: #e6f4ea; padding: 15px; border-radius: 8px; margin: 20px 0; color: #137333;">
        <h3 style="margin-top: 0;">¡Pago Recibido!</h3>
        <p>Tu orden ha sido procesada mediante tarjeta y está <strong>APROBADA</strong>.</p>
      </div>
    `;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #1e293b; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="cid:logo" alt="MOTOPILLOS" style="max-height: 45px; display: block; margin: 0 auto;" />
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h2>¡Gracias por tu compra, ${order.customerName}!</h2>
        <p>Hemos recibido tu pedido correctamente. A continuación, te mostramos los detalles de tu orden:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Orden ID:</strong> #${order.id.split('-')[0].toUpperCase()}</p>
          <p style="margin: 5px 0 0 0;"><strong>Dirección de envío:</strong> ${order.shippingAddress}</p>
          <p style="margin: 5px 0 0 0; color: #1e293b; font-weight: bold;">Tiempo estimado de entrega: 2 a 4 semanas.</p>
        </div>

        ${paymentInstructions}
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Producto</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Cant.</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; color: #666;">Subtotal:</td>
              <td style="padding: 10px; text-align: right; color: #666;">
                ₡${(subtotalUSD * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; color: #666;">Impuestos:</td>
              <td style="padding: 10px; text-align: right; color: #666;">
                ₡${(ivaUSD * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; color: #666; border-bottom: 2px solid #ddd;">Envío Nacional:</td>
              <td style="padding: 10px; text-align: right; color: #666; border-bottom: 2px solid #ddd;">
                ₡${(shippingUSD * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 1.1em;">Total a Pagar:</td>
              <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 1.1em; color: #1e293b;">
                ₡${(order.totalAmount * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
              </td>
            </tr>
          </tfoot>
        </table>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://wa.me/50670465000?text=Hola%20tengo%20una%20consulta%20sobre%20mi%20orden%20%23${order.id.split('-')[0].toUpperCase()}" style="display: inline-block; background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Contactar por WhatsApp
          </a>
        </div>

        <p style="color: #666; font-size: 0.9em; text-align: center;">Si tienes alguna pregunta sobre tu orden, no dudes en contactarnos.</p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Motopillos" <' + process.env.SMTP_USER + '>',
      to: order.customerEmail,
      subject: `Confirmación de Orden #${order.id.split('-')[0].toUpperCase()} - Motopillos`,
      html: html,
      attachments: [{
        filename: 'logo.png',
        path: process.cwd() + '/public/logo.png',
        cid: 'logo'
      }]
    });
    console.log("Message sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email: ", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(user, newPassword) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #1e293b; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="cid:logo" alt="MOTOPILLOS" style="max-height: 45px; display: block; margin: 0 auto;" />
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h2>¡Bienvenido a Motopillos, ${user.name}!</h2>
        <p>Hemos creado una cuenta automáticamente con tu primera compra para que puedas darle seguimiento a tus órdenes y agilizar tus futuras compras.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Usuario:</strong> ${user.email}</p>
          <p style="margin: 10px 0 0 0;"><strong>Contraseña Temporal:</strong> <span style="font-family: monospace; font-size: 1.1em; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${newPassword}</span></p>
        </div>

        <p>Puedes cambiar esta contraseña iniciando sesión en "Mi Cuenta".</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Motopillos" <' + process.env.SMTP_USER + '>',
      to: user.email,
      subject: '¡Tu cuenta en Motopillos ha sido creada!',
      html: html,
      attachments: [{
        filename: 'logo.png',
        path: process.cwd() + '/public/logo.png',
        cid: 'logo'
      }]
    });
  } catch (error) {
    console.error("Error sending welcome email: ", error);
  }
}

export async function sendOrderStatusEmail(order) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  let exchangeRate = 515;
  try {
    const configRecord = await prisma.config.findUnique({ where: { key: 'adminConfig' } });
    if (configRecord && configRecord.value) {
      const adminConfig = JSON.parse(configRecord.value);
      if (adminConfig.exchangeRate) exchangeRate = adminConfig.exchangeRate;
    }
  } catch (e) {
    console.error("Error fetching admin config for email:", e);
  }

  const parsedItems = typeof order.itemsList === 'string' ? JSON.parse(order.itemsList) : order.itemsList;
  
  let subtotalUSD = 0;
  parsedItems.forEach(item => {
    subtotalUSD += item.price * item.qty;
  });
  const ivaUSD = subtotalUSD * 0.13;
  const shippingUSD = Math.max(0, order.totalAmount - subtotalUSD - ivaUSD);

  const itemsHtml = parsedItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">
        ₡${((item.priceCRC || (item.price * exchangeRate)) * item.qty).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
      </td>
    </tr>
  `).join('');

  const statusMap = {
    'APPROVED': 'APROBADO (En procesamiento)',
    'PURCHASED': 'COMPRADO EN PROVEEDOR (En camino a CR)',
    'DELIVERED': 'ENTREGADO',
    'PENDING': 'PENDIENTE DE PAGO'
  };

  const statusColorMap = {
    'APPROVED': '#10b981',
    'PURCHASED': '#8b5cf6',
    'DELIVERED': '#3b82f6',
    'PENDING': '#f59e0b'
  };

  const currentStatusStr = statusMap[order.status] || order.status;
  const statusColor = statusColorMap[order.status] || '#1e293b';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #1e293b; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="cid:logo" alt="MOTOPILLOS" style="max-height: 45px; display: block; margin: 0 auto;" />
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h2>Actualización de Orden, ${order.customerName}</h2>
        <p>Te informamos que tu orden ha cambiado de estado:</p>
        
        <div style="background-color: ${statusColor}15; border: 1px solid ${statusColor}40; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0; color: ${statusColor};">${currentStatusStr}</h3>
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Orden ID:</strong> #${order.id.split('-')[0].toUpperCase()}</p>
          <p style="margin: 5px 0 0 0;"><strong>Dirección de envío:</strong> ${order.shippingAddress}</p>
          <p style="margin: 5px 0 0 0; color: #1e293b; font-weight: bold;">Tiempo estimado de entrega: 2 a 4 semanas.</p>
        </div>
        
        <h3 style="margin-top: 30px;">Resumen de tu orden</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Producto</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Cant.</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; color: #666;">Subtotal:</td>
              <td style="padding: 10px; text-align: right; color: #666;">
                ₡${(subtotalUSD * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; color: #666;">Impuestos:</td>
              <td style="padding: 10px; text-align: right; color: #666;">
                ₡${(ivaUSD * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; color: #666; border-bottom: 2px solid #ddd;">Envío Nacional:</td>
              <td style="padding: 10px; text-align: right; color: #666; border-bottom: 2px solid #ddd;">
                ₡${(shippingUSD * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 1.1em;">Total Pagado:</td>
              <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 1.1em; color: #1e293b;">
                ₡${(order.totalAmount * exchangeRate).toLocaleString('es-CR', { maximumFractionDigits: 0 })}
              </td>
            </tr>
          </tfoot>
        </table>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://wa.me/50670465000?text=Hola%20tengo%20una%20consulta%20sobre%20mi%20orden%20%23${order.id.split('-')[0].toUpperCase()}" style="display: inline-block; background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Motopillos" <' + process.env.SMTP_USER + '>',
      to: order.customerEmail,
      subject: `Actualización de Orden #${order.id.split('-')[0].toUpperCase()}: ${currentStatusStr}`,
      html: html,
      attachments: [{
        filename: 'logo.png',
        path: process.cwd() + '/public/logo.png',
        cid: 'logo'
      }]
    });
    console.log("Status message sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending status email: ", error);
    return { success: false, error };
  }
}
