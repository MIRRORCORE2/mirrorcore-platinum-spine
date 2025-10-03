class MemoryLattice {
  constructor() { this.items = []; }
  store(x) { if (x) this.items.push({ text: String(x), ts: Date.now() }); }
  size() { return this.items.length; }
}
module.exports = MemoryLattice;
