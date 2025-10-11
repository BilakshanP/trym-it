const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for URL mappings
const urlDatabase = new Map();
const stats = {
  totalUrls: 0,
  totalRedirects: 0
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to generate short code
function generateShortCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';
  for (let i = 0; i < length; i++) {
    shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortCode;
}

// Helper function to validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Trym URL Shortener',
    stats: stats
  });
});

// Shorten URL endpoint
app.post('/api/shorten', (req, res) => {
  const { url, customCode } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Generate or use custom short code
  let shortCode = customCode;
  
  if (customCode) {
    // Check if custom code is already taken
    if (urlDatabase.has(customCode)) {
      return res.status(409).json({ error: 'Custom code already exists' });
    }
    // Validate custom code (alphanumeric only)
    if (!/^[a-zA-Z0-9]+$/.test(customCode)) {
      return res.status(400).json({ error: 'Custom code must be alphanumeric' });
    }
  } else {
    // Generate unique short code
    do {
      shortCode = generateShortCode();
    } while (urlDatabase.has(shortCode));
  }

  // Store the mapping
  urlDatabase.set(shortCode, {
    originalUrl: url,
    createdAt: new Date().toISOString(),
    clicks: 0
  });
  
  stats.totalUrls++;

  // Return the shortened URL
  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  res.json({
    success: true,
    shortUrl: shortUrl,
    shortCode: shortCode,
    originalUrl: url
  });
});

// Get URL info endpoint
app.get('/api/url/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const urlData = urlDatabase.get(shortCode);

  if (!urlData) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({
    shortCode: shortCode,
    originalUrl: urlData.originalUrl,
    createdAt: urlData.createdAt,
    clicks: urlData.clicks
  });
});

// Get all URLs endpoint (for debugging/management)
app.get('/api/urls', (req, res) => {
  const urls = [];
  urlDatabase.forEach((data, shortCode) => {
    urls.push({
      shortCode: shortCode,
      originalUrl: data.originalUrl,
      createdAt: data.createdAt,
      clicks: data.clicks
    });
  });
  res.json({ urls: urls, total: urls.length });
});

// Redirect short URL to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  
  // Skip if it's an API route or static file
  if (shortCode.startsWith('api') || shortCode.includes('.')) {
    return res.status(404).send('Not found');
  }

  const urlData = urlDatabase.get(shortCode);

  if (!urlData) {
    return res.status(404).send('Short URL not found. <a href="/">Go back to home</a>');
  }

  // Increment click counter
  urlData.clicks++;
  stats.totalRedirects++;

  // Redirect to original URL
  res.redirect(urlData.originalUrl);
});

// Start server
app.listen(PORT, () => {
  console.log(`Trym URL Shortener is running on http://localhost:${PORT}`);
});
