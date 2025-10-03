const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const { anchor, driftlock, memory, lsk, hlc } = req.app.locals;

  const state = anchor.readState();
  const stabilized = driftlock.apply(state);
  memory.store(prompt);
  const ethics = lsk.evaluate(prompt);
  const hlcState = hlc.microStabilize();

  res.json({
    input: prompt,
    IL: stabilized.lastIL,
    ethics,
    memorySize: memory.size(),
    hlcState
  });
});

module.exports = router;
