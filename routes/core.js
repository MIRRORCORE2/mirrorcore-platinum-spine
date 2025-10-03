// routes/core.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    service: 'mirrorcore-platinum-spine',
    status: 'ok',
    core: true,
    message: 'Core Health check passed'
  });
});

module.exports = router;
