const express = require('express');
const bodyParser = require('body-parser');

// Core modules
const AnchorEngine = require('./api/core/anchor_engine.js');
const DriftLock = require('./api/core/driftlock.js');
const MemoryLattice = require('./api/core/memory_lattice.js');
const LSKPlus = require('./api/core/lsk_plus.js');
const HLCOverlay = require('./api/core/hlc_overlay.js');

// Route modules
const coreRoutes = require('./routes/core.js');
const heartbeatRoutes = require('./routes/heartbeat.js');
const diagnosticsRoutes = require('./routes/diagnostics.js');
const chatRoutes = require('./routes/chat.js');

const app = express();
app.use(bodyParser.json());

// Initialize core modules
const anchor = new AnchorEngine();
const driftlock = new DriftLock(anchor);
const memory = new MemoryLattice();
const lsk = new LSKPlus();
const hlc = new HLCOverlay(anchor, driftlock);

// Expose to routes
app.locals.anchor = anchor;
app.locals.driftlock = driftlock;
app.locals.memory = memory;
app.locals.lsk = lsk;
app.locals.hlc = hlc;

// Routes
app.use('/api/core', coreRoutes);
app.use('/api/heartbeat', heartbeatRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/chat', chatRoutes);

// Simple homepage so "/" works
app.get('/', (req, res) => {
  res.send('MirrorCore Platinum is online. Try /api/core, /api/diagnostics, /api/heartbeat, or POST /api/chat');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Platinum Spine running on port ${PORT}`));
