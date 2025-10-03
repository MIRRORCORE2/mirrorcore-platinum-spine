const express = require('express');
const bodyParser = require('body-parser');

// Core modules
const AnchorEngine = require('./core/anchor_engine');
const DriftLock = require('./core/driftlock');
const MemoryLattice = require('./core/memory_lattice');
const LSKPlus = require('./core/lsk_plus');
const HLCOverlay = require('./core/hlc_overlay');

// Route modules
const coreRoutes = require('./routes/core');
const heartbeatRoutes = require('./routes/heartbeat');
const diagnosticsRoutes = require('./routes/diagnostics');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(bodyParser.json());

// Initialize core modules
const anchor = new AnchorEngine();
const driftlock = new DriftLock(anchor);
const memory = new MemoryLattice();
const lsk = new LSKPlus();
const hlc = new HLCOverlay(anchor, driftlock);

// 🔑 Make these available to all routes
app.locals.anchor = anchor;
app.locals.driftlock = driftlock;
app.locals.memory = memory;
app.locals.lsk = lsk;
app.locals.hlc = hlc;

// Attach routes
app.use('/api/core', coreRoutes);
app.use('/api/heartbeat', heartbeatRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/chat', chatRoutes);

// Example inline chat (kept for quick testing)
app.post('/api/chat-inline', (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Platinum Spine running on port ${PORT}`)
);
