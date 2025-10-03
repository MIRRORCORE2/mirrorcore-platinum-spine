class HLCOverlay {
  constructor(anchor, driftlock) { this.anchor = anchor; this.driftlock = driftlock; }
  microStabilize() {
    const st = this.anchor.readState();
    const out = this.driftlock.apply(st);
    return { ok: true, IL: out.lastIL };
  }
}
module.exports = HLCOverlay;
