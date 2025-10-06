// scripts/client_ask.js
const BASE = process.env.RENDER_URL || 'https://mirrorcore-platinum-mcos.onrender.com';
const msg = process.argv.slice(2).join(' ') || 'ping';

(async () => {
  try {
    const res = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: msg })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Client error:', err?.message || err);
    process.exit(1);
  }
})();
