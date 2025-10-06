import fetch from 'node-fetch';

const BASE = process.env.RENDER_URL || 'https://mirrorcore-platinum-mcos.onrender.com';
const msg = process.argv.slice(2).join(' ') || 'ping';

const payload = { prompt: msg };

const res = await fetch(`${BASE}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

const data = await res.json();
console.log(JSON.stringify(data, null, 2));
