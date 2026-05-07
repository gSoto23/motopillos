require('dotenv').config({ path: '.env' });

async function run() {
  const authPayload = { apiuser: process.env.TILOPAY_USER, password: process.env.TILOPAY_PASSWORD };
  const loginRes = await fetch(`${process.env.TILOPAY_API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authPayload) });
  const loginData = await loginRes.json();
  const token = loginData.access_token || loginData.token;
  
  const consultPayload1 = { key: process.env.TILOPAY_KEY, orderNumber: "5f61e1609c574e1bb60cf46460f340" };
  const consultRes1 = await fetch(`${process.env.TILOPAY_API_URL}/consult`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(consultPayload1) });
  console.log("CONSULT 1:", await consultRes1.text());

  const consultPayload2 = { key: process.env.TILOPAY_KEY, orderNumber: "PFC026822-5f61e1609c574e1bb60cf46460f340" };
  const consultRes2 = await fetch(`${process.env.TILOPAY_API_URL}/consult`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(consultPayload2) });
  console.log("CONSULT 2:", await consultRes2.text());

  const tsPayload = { key: process.env.TILOPAY_KEY, startDate: "2026-05-01 00:00:00", endDate: "2026-05-31 23:59:59" };
  const tsRes = await fetch(`${process.env.TILOPAY_API_URL}/consultTransactions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(tsPayload) });
  console.log("CONSULT TRANSACTIONS:", await tsRes.text());
}
run();
