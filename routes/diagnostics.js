const express = require('express');
const os = require('os');
const router = express.Router();

router.get('/', (req, res) => {
  const { anchor, driftlock, memory, lsk, hlc } = req.app.locals;

  res.json({
    service: 'mirrorcore-platinum-spine',
    status: 'ok',
    node: process.version,
    host: os.hostname(),
    uptime_s: Math.floor(process.uptime()),
    memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    modules: {
      anchor: Boolean(anchor),
      driftlock: Boolean(driftlock),
      memory: Boolean(memory),
      lsk: Boolean(lsk),
      hlc: Boolean(hlc),
    },
    IL: anchor?.readState()?.lastIL ?? null
  });
});

module.exports = router;
