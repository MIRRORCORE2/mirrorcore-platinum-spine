class LSKPlus {
  evaluate(prompt) {
    // naive ethics score: penalize negative words
    const negatives = ['hate','kill','harm'];
    let score = 1.0;
    negatives.forEach(n => { if (prompt.includes(n)) score -= 0.2; });
    return { LSK_score: Math.max(0, score) };
  }
}
module.exports = LSKPlus;
