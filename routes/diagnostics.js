// routes/diagnostics.js
const express = require("express");
const os = require("os");
const router = express.Router();

function requireCtx(req) {
  const { anchor, driftLock, lattice, lsk, overlay, bootTs } = req.app.locals;
  return { anchor, driftLock, lattice, lsk, overlay, bootTs };
}

router.get("/diagnostics", async (req, res) => {
  try {
    const { anchor, driftLock, lattice, lsk, overlay, bootTs } = requireCtx(req);

    const info = {
      service: "mirrorcore-platinum-spine",
      uptime_s: Math.floor((Date.now() - (bootTs || Date.now())) / 1000),
      node: process.version,
      host: os.hostname(),
      load: os.loadavg(),
      mem: {
        rss: process.memoryUsage().rss,
        heapUsed: process.memoryUsage().heapUsed
      },
      modules: {
        anchor: Boolean(anchor),
        driftLock: {
          present: Boolean(driftLock),
          mode: driftLock?.mode || "standard",
          recent_violations: driftLock?.stats?.violations || 0
        },
        lattice: {
          present: Boolean(lattice),
          shards: await lattice.count?.() ?? null
        },
        lsk: {
          present: Boolean(lsk),
          last_score: lsk?.lastScore ?? null
        },
        overlay: Boolean(overlay)
      },
      health: "ok"
    };

    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message || "internal_error" });
  }
});

module.exports = router;
