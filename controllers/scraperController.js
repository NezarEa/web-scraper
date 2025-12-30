const scrapingService = require('../services/scrapingService');
const { validateUrl } = require('../utils/validators');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const scraperController = {
    async scrapeUrl(req, res) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            const validation = validateUrl(url);
            if (!validation.isValid) {
                return res.status(400).json({ error: 'Invalid URL' });
            }

            const cachedData = cache.get(url);
            if (cachedData) {
                logger.info(`Cache hit: ${url}`);
                return res.json({ ...cachedData, fromCache: true });
            }

            logger.info(`Scraping: ${url}`);
            const result = await scrapingService.scrape(url);
            cache.set(url, result);

            res.json({ ...result, fromCache: false });

        } catch (error) {
            logger.error('Scrape error:', error.message);

            if (error.message.includes('timeout')) {
                return res.status(408).json({ error: 'Request timeout' });
            }
            if (error.message.includes('404')) {
                return res.status(404).json({ error: 'Page not found' });
            }
            if (error.message.includes('403')) {
                return res.status(403).json({ error: 'Access denied' });
            }

            res.status(500).json({ error: 'Scraping failed' });
        }
    },

    getCacheStats(req, res) {
        const stats = cache.getStats();
        res.json({
            keys: cache.keys().length,
            hits: stats.hits,
            misses: stats.misses
        });
    },

    clearCache(req, res) {
        cache.flushAll();
        logger.info('Cache cleared');
        res.json({ success: true });
    }
};

module.exports = scraperController;