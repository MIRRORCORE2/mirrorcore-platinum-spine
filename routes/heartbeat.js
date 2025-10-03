// routes/heartbeat.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    heartbeat: "💓",
    status: "alive",
    timestamp: Date.now()
  });
});

module.exports = router;
