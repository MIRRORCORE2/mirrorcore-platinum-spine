// routes/chat.js
const express = require('express');
const router = express.Router();

// Pull in core modules from app.locals
function requireCtx(req) {
  const { anchor, driftlock, memory, lsk, hlc } = req.app.locals;
  return { anchor, driftlock, memory, lsk, hlc };
}

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { anchor, driftlock, memory, lsk, hlc } = requireCtx(req);
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Run through stabilizers
    const state = anchor.readState();
    const stabilized = driftlock.apply(state);

    // Store input in memory
    memory.store(prompt);

    // Ethics check (LSK+)
    const ethics = lsk.evaluate(prompt);

    // HLC micro-stabilizer
    const hlcState = hlc.microStabilize();

    // Return response
    res.json({
      input: prompt,
      IL: stabilized.lastIL,
      ethics,
      memorySize: memory.size(),
      hlcState
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat processing failed' });
  }
});

module.exports = router;
