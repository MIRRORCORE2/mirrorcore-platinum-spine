// path: server.js
// Production-ready Express bootstrap for GPT Action compatibility (CommonJS)
require('dotenv').config();                 // why: allow API_KEY from .env locally
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Core modules
const AnchorEngine   = require('./api/core/anchor_engine.js');
const DriftLock      = require('./api/core/driftlock.js');
const MemoryLattice  = require('./api/core/memory_lattice.js');
const LSKPlus        = require('./api/core/lsk_plus.js');
const HLCOverlay     = require('./api/core/hlc_overlay.js');

// Route modules
const coreRoutes        = require('./routes/core.js');
const heartbeatRoutes   = require('./routes/heartbeat.js');
const diagnosticsRoutes = require('./routes/diagnostics.js');
const chatRoutes        = require('./routes/chat.js');
const memoryRoutes      = require('./routes/memory.js');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.API_KEY || '';  // set on Render to enforce auth

// --- Security & parsing
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false })); // why: safe defaults, keep CORS workable
app.use(cors({
  origin: (_origin, cb) => cb(null, true), // why: Actions often no origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  maxAge: 600,
}));
app.options('*', (_req, res) => res.status(204).end()); // preflight
app.use(bodyParser.json({ limit: '1mb' }));             // JSON bodies
app.use(morgan('combined'));                            // request logs

// --- Optional Bearer auth (enabled iff API_KEY is set)
function maybeAuth(req, res, next) {
  if (!API_KEY) return next(); // why: allow unauth dev; enforce in prod by setting API_KEY
  const hdr = req.header('authorization') || '';
  const m = hdr.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(403).json({ error: 'forbidden', reason: 'missing_authorization' });
  if (m[1] !== API_KEY) return res.status(403).json({ error: 'forbidden', reason: 'invalid_api_key' });
  return next();
}

// --- Initialize core modules
const anchor   = new AnchorEngine();
const driftlock= new DriftLock(anchor);
const memory   = new MemoryLattice();
const lsk      = new LSKPlus();
const hlc      = new HLCOverlay(anchor, driftlock);

// --- Expose to routes
app.locals.anchor   = anchor;
app.locals.driftlock= driftlock;
app.locals.memory   = memory;
app.locals.lsk      = lsk;
app.locals.hlc      = hlc;

// --- Health
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// --- Routes
app.use('/api/core',        coreRoutes);
app.use('/api/heartbeat',   heartbeatRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/chat',        maybeAuth, chatRoutes);     // enforce auth if API_KEY present
app.use('/api/memory',      memoryRoutes);

// --- Home
app.get('/', (_req, res) => {
  res.send('MirrorCore Platinum online. Try /api/core, /api/diagnostics, /api/heartbeat, /api/memory, or POST /api/chat');
});

// --- 404 & error
app.use((_req, res) => res.status(404).json({ error: 'not_found' }));
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: 'internal_error', message: String(err?.message || err) });
});

// --- Boot
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Platinum Spine running on port ${PORT}`);
});


// path: routes/chat.js
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { prompt } = req.body || {};
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'bad_request', reason: 'prompt_required' });
  }

  const { anchor, driftlock, memory, lsk, hlc } = req.app.locals || {};
  if (!anchor || !driftlock || !memory || !lsk || !hlc) {
    return res.status(500).json({ error: 'server_misconfig', reason: 'locals_unset' });
  }

  try {
    const state       = anchor.readState();
    const stabilized  = driftlock.apply(state);
    memory.store(prompt);
    const ethics      = lsk.evaluate(prompt);
    const hlcState    = hlc.microStabilize();

    return res.json({
      ok: true,
      input: prompt,
      IL: stabilized.lastIL,
      ethics,
      memorySize: typeof memory.size === 'function' ? memory.size() : null,
      hlcState,
    });
  } catch (e) {
    return res.status(500).json({ error: 'internal_error', message: String(e?.message || e) });
  }
});

module.exports = router;


/*
# --- Local verification (replace YOUR_KEY if using auth) ---

# 1) Optional auth
export API_KEY=YOUR_KEY

# 2) Start
node server.js

# 3) Health
curl -i http://localhost:3000/health

# 4) Chat without auth (should 200 if API_KEY unset; 403 if set)
curl -i -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"ping"}'

# 5) Chat with auth (should 200)
curl -i -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer ${API_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Luciana system ping — verify integrity level and memory lattice coherence."}'
*/
