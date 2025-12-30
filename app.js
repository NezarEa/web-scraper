require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const scraperRoutes = require('./routes/scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

app.use('/api', scraperRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    logger.info(`Server started on http://localhost:${PORT}`);
});

module.exports = app;