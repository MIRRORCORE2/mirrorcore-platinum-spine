// scripts/client_load.js
import fs from 'fs';
import readline from 'readline';

const BASE = process.env.RENDER_URL || 'https://mirrorcore-platinum-mcos.onrender.com';
const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/client_load.js <path-to-jsonl>');
  process.exit(1);
}

const post = async (prompt) => {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data;
};

const rl = readline.createInterface({
  input: fs.createReadStream(file),
  crlfDelay: Infinity
});

let lineNo = 0;
(async () => {
  for await (const line of rl) {
    lineNo++;
    const trimmed = line.trim();
    if (!trimmed) continue;
    let prompt;
    try {
      const obj = JSON.parse(trimmed);
      // Your JSONL lines look like: { "id": "MCQ-0005", "text": "..." }
      if (obj.text) {
        prompt = obj.id ? `${obj.id} — ${obj.text}` : obj.text;
      } else {
        // fallback: post raw line
        prompt = trimmed;
      }
    } catch {
      // not JSON? send raw line
      prompt = trimmed;
    }
    try {
      const out = await post(prompt);
      console.log(JSON.stringify({ line: lineNo, ok: true, id: (out.id||null), memorySize: out.memorySize, IL: out.IL }));
    } catch (err) {
      console.error(JSON.stringify({ line: lineNo, ok: false, error: err.message }));
    }
  }
})();
