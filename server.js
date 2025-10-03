const express = require('express');
const bodyParser = require('body-parser');
const AnchorEngine = require('./core/anchor_engine');
const DriftLock = require('./core/driftlock');
const MemoryLattice = require('./core/memory_lattice');
const LSKPlus = require('./core/lsk_plus');
const HLCOverlay = require('./core/hlc_overlay');

const app = express();
app.use(bodyParser.json());

const anchor = new AnchorEngine();
const driftlock = new DriftLock(anchor);
const memory = new MemoryLattice();
const lsk = new LSKPlus();
const hlc = new HLCOverlay(anchor, driftlock);

// Simple chat API
app.post('/api/chat', (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

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

// Diagnostics
app.get('/api/diagnostics', (req, res) => {
  res.json({
    IL: anchor.readState().lastIL,
    memorySize: memory.size(),
    ethics: lsk.evaluate('diagnostics')
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Platinum Spine running on port ${PORT}`));
