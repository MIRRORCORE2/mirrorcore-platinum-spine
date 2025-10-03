class DriftLock {
  constructor(anchor) { this.anchor = anchor; this.gamma = 0.5; this.rho = 0.3; }
  apply(state) {
    const drift = state.Symbolic_load_sum;
    state.lastIL = state.lastIL - this.gamma * drift + this.rho * state.Grounding;
    return state;
  }
}
module.exports = DriftLock;
