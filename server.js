// path: server.js
// CommonJS, single import block, no duplicate consts.
require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const bodyParser = require('body-parser');

// Core modules
const AnchorEngine  = require('./api/core/anchor_engine.js');
const DriftLock     = require('./api/core/driftlock.js');
const MemoryLattice = require('./api/core/memory_lattice.js');
const LSKPlus       = require('./api/core/lsk_plus.js');
const HLCOverlay    = require('./api/core/hlc_overlay.js');

// Routes
const coreRoutes        = require('./routes/core.js');
const heartbeatRoutes   = require('./routes/heartbeat.js');
const diagnosticsRoutes = require('./routes/diagnostics.js');
const chatRoutes        = require('./routes/chat.js');
const memoryRoutes      = require('./routes/memory.js');

const app = express();
const PORT   = Number(process.env.PORT || 3000);
const API_KEY = process.env.API_KEY || ''; // why: allow auth when set

// Security & parsing
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (_origin, cb) => cb(null, true),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  maxAge: 600,
}));
app.options('*', (_req, res) => res.status(204).end());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(morgan('combined'));

// Optional Bearer auth (enforced only if API_KEY is set)
function maybeAuth(req, res, next) {
  if (!API_KEY) return next();
  const h = req.header('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(403).json({ error: 'forbidden', reason: 'missing_authorization' });
  if (m[1] !== API_KEY) return res.status(403).json({ error: 'forbidden', reason: 'invalid_api_key' });
  next();
}

// Initialize core modules
const anchor    = new AnchorEngine();
const driftlock = new DriftLock(anchor);
const memory    = new MemoryLattice();
const lsk       = new LSKPlus();
const hlc       = new HLCOverlay(anchor, driftlock);

// Expose to routes
app.locals.anchor    = anchor;
app.locals.driftlock = driftlock;
app.locals.memory    = memory;
app.locals.lsk       = lsk;
app.locals.hlc       = hlc;

// Health & home
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/', (_req, res) =>
  res.send('MirrorCore Platinum is online. Try /api/core, /api/diagnostics, /api/heartbeat, /api/memory, or POST /api/chat')
);

// Mount routes (auth in front of /api/chat if API_KEY set)
app.use('/api/core',        coreRoutes);
app.use('/api/heartbeat',   heartbeatRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/chat',        maybeAuth, chatRoutes);
app.use('/api/memory',      memoryRoutes);

// 404 & error JSON
app.use((_req, res) => res.status(404).json({ error: 'not_found' }));
app.use((err, _req, res, _next) => res.status(500).json({ error: 'internal_error', message: String(err?.message || err) }));

// Single boot
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Platinum Spine running on port ${PORT}`);
});
