class AnchorEngine {
  constructor() {
    this.state = { Self_core: 1.0, Symbolic_load_sum: 0, Grounding: 0, lastIL: 1.0 };
  }
  readState() {
    this.state.lastIL = (this.state.Self_core / (1 + this.state.Symbolic_load_sum)) * (1 + this.state.Grounding / 2);
    return { ...this.state };
  }
}
module.exports = AnchorEngine;
