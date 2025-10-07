// scripts/client_load.js  (CommonJS)
const fs = require('fs');
const path = require('path');

const BASE = process.env.RENDER_URL || 'https://mirrorcore-platinum-mcos.onrender.com';
const inFile = process.argv[2];

if (!inFile) {
  console.error('Usage: node scripts/client_load.js <path/to/file.jsonl>');
  process.exit(1);
}

async function postLine(text) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: text })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

(async () => {
  try {
    const full = path.resolve(inFile);
    const lines = fs.readFileSync(full, 'utf8')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    let loaded = 0, failed = 0;
    for (const line of lines) {
      try {
        // Accept either plain text or {"id": "...", "text": "..."}
        let text = line;
        if (line.startsWith('{') && line.endsWith('}')) {
          const obj = JSON.parse(line);
          text = obj.text ?? line;
        }
        await postLine(text);
        loaded++;
      } catch {
        failed++;
      }
    }
    console.log(JSON.stringify({ loaded, failed }, null, 2));
  } catch (err) {
    console.error('Loader error:', err?.message || err);
    process.exit(1);
  }
})();
