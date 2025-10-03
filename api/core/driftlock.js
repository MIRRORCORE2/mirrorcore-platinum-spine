class DriftLock {
  constructor(anchor) { this.anchor = anchor; }
  apply(state) {
    const s = { ...state };
    const raw = s.lastIL ?? 1;
    const bounded = Math.max(0, Math.min(1.5, raw));       // clamp
    const smoothed = Number(((bounded * 0.8) + 0.2).toFixed(3)); // nudge to safety
    return { ...s, lastIL: smoothed };
  }
}
module.exports = DriftLock;
