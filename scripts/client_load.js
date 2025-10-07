import fs from 'node:fs/promises';

const BASE = process.env.RENDER_URL || 'https://mirrorcore-platinum-mcos.onrender.com';
const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/client_load.js <path-to-jsonl>');
  process.exit(1);
}

const fetchJson = async (url, opts) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const run = async () => {
  const raw = await fs.readFile(file, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  let ok = 0, fail = 0;

  for (const line of lines) {
    let payload;
    try {
      const j = JSON.parse(line);
      // store exactly what you send
      payload = { prompt: `${j.id}  ${j.text}` };
    } catch (e) {
      console.error('Bad JSONL line:', line.slice(0,120));
      fail++;
      continue;
    }
    try {
      await fetchJson(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      ok++;
    } catch (e) {
      console.error('Send failed:', e.message);
      fail++;
    }
  }
  console.log(JSON.stringify({ loaded: ok, failed: fail }, null, 2));
};

run().catch(e => { console.error(e); process.exit(1); });
