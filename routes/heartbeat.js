const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { anchor } = req.app.locals;
  res.json({
    alive: true,
    ts: Date.now(),
    IL: anchor?.readState()?.lastIL ?? null
  });
});

module.exports = router;
