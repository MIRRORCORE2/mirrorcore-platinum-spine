// api/core/memory_lattice.js
const { randomUUID } = require('crypto');

class MemoryLattice {
  constructor() {
    this.items = [];
    this.maxItems = 5000; // simple cap to avoid unbounded growth
  }

  store(x) {
    if (!x) return;
    const text = String(x);
    const item = {
      id: (typeof randomUUID === 'function') ? randomUUID() : String(Date.now()),
      text,
      ts: Date.now()
    };
    this.items.push(item);
    if (this.items.length > this.maxItems) this.items.shift();
  }

  size() {
    return this.items.length;
  }

  // Return the last N full entries (most recent last)
  recent(n = 5) {
    const take = Math.max(1, Math.min(Number(n) || 5, this.items.length));
    return this.items.slice(-take);
  }

  // Return last N entries but with previews
  summarize(n = 5) {
    return this.recent(n).map(it => ({
      id: it.id,
      ts: it.ts,
      preview: it.text.length > 200 ? it.text.slice(0, 200) + '…' : it.text
    }));
  }

  // Use with care; we keep it available for the commented route
  clearAll() {
    this.items = [];
  }
}

module.exports = MemoryLattice;
