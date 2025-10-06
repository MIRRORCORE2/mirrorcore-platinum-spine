// scripts/client_ask.js
const url = process.env.RENDER_URL || 'https://mirrorcore-platinum-mcos.onrender.com';
const prompt = process.argv.slice(2).join(' ') || 'Hello Spine';

async function main() {
  try {
    const res = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      console.error('HTTP', res.status, await res.text());
      process.exit(1);
    }
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Request failed:', e.message);
    process.exit(1);
  }
}

main();
