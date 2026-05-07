import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, amount, customerName, customerEmail, provincia, canton, distrito, address, phone } = body;

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
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://motopillos.com' // Replace with actual production URL
      : 'http://localhost:3000';

    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

    const payload = {
      redirect: `${baseUrl}/gracias?orderId=${orderId}`,
      key: process.env.TILOPAY_KEY,
      amount: amount.toFixed(2).toString(),
      currency: "CRC",
      orderNumber: orderId.replace(/-/g, '').substring(0, 30), // Tilopay orderNumber can be strict on length
      capture: "1",
      billToFirstName: firstName,
      billToLastName: lastName,
      billToAddress: address.substring(0, 50),
      billToAddress2: distrito.substring(0, 50),
      billToCity: canton.substring(0, 50),
      billToState: provincia.substring(0, 50),
      billToZipPostCode: "10000",
      billToCountry: "CR",
      billToTelephone: phone || "88888888",
      billToEmail: customerEmail,
      subscription: "0",
      platform: "motopillos",
      token_version: "v2"
    };

    const response = await fetch(`${process.env.TILOPAY_API_URL}/processPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Tilopay Error Response", await response.text());
      return NextResponse.json({ url: `/gracias?orderId=${orderId}&simulated=true` });
    }

    const data = await response.json();
    
    // Tilopay processPayment responds with { type: "100", html: "Use url redirect", url: "https://secure.tilopay.com..." }
    if (data.type === "100" && data.url) {
        return NextResponse.json({ url: data.url });
    } else {
        console.error("Tilopay Error", data);
        return NextResponse.json({ url: `/gracias?orderId=${orderId}&simulated=true` });
    }

  } catch (error) {
    console.error("Tilopay Checkout Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
