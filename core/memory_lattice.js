class MemoryLattice {
  constructor() { this.storehouse = []; }
  store(input) { this.storehouse.push(input); }
  size() { return this.storehouse.length; }
}
module.exports = MemoryLattice;