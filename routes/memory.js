const express = require('express');
const router = express.Router();

/**
 * GET /api/memory?limit=5          → last N entries (full text)
 * GET /api/memory/summary?limit=5  → summarized view (safe previews)
 */
router.get('/', (req, res) => {
  const { memory } = req.app.locals;
  const limit = parseInt(req.query.limit || '5', 10);
  return res.json({ ok: true, mode: 'recent', data: memory.recent(limit) });
});

router.get('/summary', (req, res) => {
  const { memory } = req.app.locals;
  const limit = parseInt(req.query.limit || '5', 10);
  return res.json({ ok: true, mode: 'summary', data: memory.summarize(limit) });
});

// ⚠ Keep disabled unless you truly need it.
// router.post('/clear', (req, res) => {
//   const { memory } = req.app.locals;
//   memory.clearAll();
//   return res.json({ ok: true, cleared: true });
// });

module.exports = router;
