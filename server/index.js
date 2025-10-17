require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const storage = require('./utils/storage');

const authRoutes = require('./routes/auth');
const linksRoutes = require('./routes/links');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linksRoutes);

// Redirect route - handle short codes
app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;

    const link = storage.getLink(shortCode);

    if (!link) {
        return res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
    }

    // Increment click count
    storage.incrementLinkClicks(shortCode);

    // Redirect to the original URL
    res.redirect(link.url);
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
