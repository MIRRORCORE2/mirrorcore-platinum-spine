class LSKPlus {
  evaluate(text) {
    const t = (text || '').toLowerCase();
    const flags = { kind: true, safe: !t.includes('harm'), user_consented: true };
    const score = flags.kind && flags.safe ? 'pass' : 'review';
    return { score, ...flags };
  }
}
module.exports = LSKPlus;
