const { randomUUID } = require('crypto');

class MemoryLattice {
  constructor() {
    this.items = [];
    this.maxItems = 5000; // cap growth
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

  recent(n = 5) {
    const take = Math.max(1, Math.min(Number(n) || 5, this.items.length));
    return this.items.slice(-take);
  }

  summarize(n = 5) {
    return this.recent(n).map(it => ({
      id: it.id,
      ts: it.ts,
      preview: it.text.length > 200 ? it.text.slice(0, 200) + '…' : it.text
    }));
  }

  clearAll() {
    this.items = [];
  }
}

module.exports = MemoryLattice;
