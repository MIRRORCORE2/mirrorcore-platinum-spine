class MemoryLattice {
  constructor() { this.items = []; }

  store(x) {
    if (!x) return;
    this.items.push({
      text: String(x),
      ts: Date.now()
    });
  }

  size() { return this.items.length; }

  recent(n = 5) {
    const k = Math.max(0, Math.min(n, this.items.length));
    return this.items.slice(-k).reverse(); // newest first
  }

  summarize(n = 5) {
    const rows = this.recent(n).map((it, i) => ({
      idx: i + 1,
      ts: it.ts,
      preview: it.text.length > 140 ? it.text.slice(0, 137) + '…' : it.text
    }));
    return { count: this.items.length, latest: rows };
  }

  // optional: clear (disabled by default; uncomment route only if you really need it)
  clearAll() { this.items = []; }
}

module.exports = MemoryLattice;
