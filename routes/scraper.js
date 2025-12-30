const express = require('express');
const rateLimit = require('express-rate-limit');
const scraperController = require('../controllers/scraperController');

const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/scrape', limiter, scraperController.scrapeUrl);
router.get('/cache/stats', scraperController.getCacheStats);
router.delete('/cache/clear', scraperController.clearCache);

module.exports = router;