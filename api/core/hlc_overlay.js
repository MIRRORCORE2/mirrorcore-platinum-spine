class HLCOverlay {
  constructor(anchor, driftlock) { this.anchor = anchor; this.driftlock = driftlock; }
  microStabilize() {
    let st = this.anchor.readState();
    st.Grounding += 0.1;
    return this.driftlock.apply(st);
  }
}
module.exports = HLCOverlay;
