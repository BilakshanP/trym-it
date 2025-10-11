const express = require('express');
const storage = require('../utils/storage');
const { generateShortCode } = require('../utils/shortcode');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a new short link (protected)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { url, customCode, expiresInHours } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Generate or use custom short code
    let shortCode = customCode;
    if (customCode) {
      if (customCode.length < 3 || customCode.length > 20) {
        return res.status(400).json({ error: 'Custom code must be 3-20 characters' });
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(customCode)) {
        return res.status(400).json({ error: 'Custom code can only contain letters, numbers, hyphens, and underscores' });
      }
      if (storage.linkExists(customCode)) {
        return res.status(409).json({ error: 'Custom code already exists' });
      }
    } else {
      // Generate unique short code
      do {
        shortCode = generateShortCode();
      } while (storage.linkExists(shortCode));
    }

    // Calculate expiry
    let expiresAt = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
    }

    // Create link
    const link = storage.createLink(url, shortCode, expiresAt, req.user.username);

    res.status(201).json({
      message: 'Link created successfully',
      link: {
        id: link.id,
        url: link.url,
        shortCode: link.shortCode,
        shortUrl: `${req.protocol}://${req.get('host')}/${link.shortCode}`,
        expiresAt: link.expiresAt,
        createdAt: link.createdAt
      }
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's links (protected)
router.get('/', authenticateToken, (req, res) => {
  try {
    const links = storage.getUserLinks(req.user.username);
    
    const linksWithUrls = links.map(link => ({
      id: link.id,
      url: link.url,
      shortCode: link.shortCode,
      shortUrl: `${req.protocol}://${req.get('host')}/${link.shortCode}`,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
      clicks: link.clicks
    }));

    res.json({ links: linksWithUrls });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a link (protected)
router.delete('/:shortCode', authenticateToken, (req, res) => {
  try {
    const { shortCode } = req.params;

    const deleted = storage.deleteLink(shortCode, req.user.username);

    if (!deleted) {
      return res.status(404).json({ error: 'Link not found or unauthorized' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
