const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const scrapingService = {
    async scrape(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: parseInt(process.env.SCRAPE_TIMEOUT) || 10000,
                maxRedirects: 5,
                maxContentLength: 10 * 1024 * 1024,
                validateStatus: (status) => status < 500
            });

            if (response.status === 404) throw new Error('404: Not found');
            if (response.status === 403) throw new Error('403: Access denied');
            if (response.status >= 400) throw new Error(`HTTP error ${response.status}`);

            const $ = cheerio.load(response.data);

            const data = {
                url,
                scrapedAt: new Date().toISOString(),
                title: this.extractTitle($),
                meta: this.extractMeta($),
                headings: this.extractHeadings($),
                paragraphs: this.extractParagraphs($),
                links: this.extractLinks($, url),
                images: this.extractImages($, url),
                stats: {}
            };

            data.stats = {
                totalHeadings: data.headings.length,
                totalParagraphs: data.paragraphs.length,
                totalLinks: data.links.length,
                totalImages: data.images.length,
                wordCount: this.countWords(data.paragraphs)
            };

            return data;

        } catch (error) {
            if (error.code === 'ECONNABORTED') throw new Error('timeout: Connection timeout');
            if (error.code === 'ENOTFOUND') throw new Error('DNS: Domain not found');
            if (error.code === 'ECONNREFUSED') throw new Error('Connection refused');
            
            logger.error('Scrape error:', error.message);
            throw error;
        }
    },

    extractTitle($) {
        return $('title').text().trim() || 
               $('h1').first().text().trim() || 
               'No title';
    },

    extractMeta($) {
        return {
            description: $('meta[name="description"]').attr('content') || '',
            keywords: $('meta[name="keywords"]').attr('content') || '',
            author: $('meta[name="author"]').attr('content') || '',
            ogTitle: $('meta[property="og:title"]').attr('content') || '',
            ogDescription: $('meta[property="og:description"]').attr('content') || '',
            ogImage: $('meta[property="og:image"]').attr('content') || ''
        };
    },

    extractHeadings($) {
        const headings = [];
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
            $(tag).each((i, el) => {
                const text = $(el).text().trim();
                if (text && text.length > 0) {
                    headings.push({
                        level: tag,
                        text: text
                    });
                }
            });
        });
        return headings;
    },

    extractParagraphs($) {
        const paragraphs = [];
        $('p').each((i, el) => {
            let text = $(el).text().trim();
            text = text.replace(/\s+/g, ' ');
            if (text && text.length > 20) {
                paragraphs.push(text);
            }
        });
        return paragraphs;
    },

    extractLinks($, baseUrl) {
        const links = [];
        const seen = new Set();

        $('a').each((i, el) => {
            let href = $(el).attr('href');
            if (!href) return;

            try {
                if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
                    href = new URL(href, baseUrl).href;
                }
            } catch (e) {
                return;
            }

            if (href.startsWith('http') && !seen.has(href)) {
                seen.add(href);
                links.push({
                    url: href,
                    text: $(el).text().trim() || 'Link'
                });
            }
        });

        return links;
    },

    extractImages($, baseUrl) {
        const images = [];
        const seen = new Set();

        $('img').each((i, el) => {
            let src = $(el).attr('src');
            if (!src) return;

            try {
                if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) {
                    src = new URL(src, baseUrl).href;
                }
            } catch (e) {
                return;
            }

            if (!seen.has(src)) {
                seen.add(src);
                images.push({
                    src: src,
                    alt: $(el).attr('alt') || '',
                    title: $(el).attr('title') || ''
                });
            }
        });

        return images;
    },

    countWords(paragraphs) {
        return paragraphs.reduce((count, p) => {
            return count + p.split(/\s+/).length;
        }, 0);
    }
};

module.exports = scrapingService;