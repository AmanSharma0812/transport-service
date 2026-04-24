const express = require('express');
const router = express.Router();
// We'll just import rider routes as placeholder since ride routes share similar endpoints
const riderRoutes = require('./rider');

// Use rider routes for now (they already cover ride operations)
router.use('/', riderRoutes);

module.exports = router;