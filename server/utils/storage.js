// Simple in-memory storage (for production, use a proper database)
class Storage {
  constructor() {
    this.users = new Map();
    this.links = new Map();
    this.linkCounter = 1000;
  }

  // User operations
  createUser(username, passwordHash) {
    if (this.users.has(username)) {
      return null;
    }
    const user = { username, passwordHash };
    this.users.set(username, user);
    return user;
  }

  findUser(username) {
    return this.users.get(username);
  }

  // Link operations
  createLink(url, shortCode, expiresAt, userId) {
    const link = {
      id: this.linkCounter++,
      url,
      shortCode,
      expiresAt,
      userId,
      createdAt: new Date().toISOString(),
      clicks: 0
    };
    this.links.set(shortCode, link);
    return link;
  }

  getLink(shortCode) {
    const link = this.links.get(shortCode);
    if (!link) return null;
    
    // Check if expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      this.links.delete(shortCode);
      return null;
    }
    
    return link;
  }

  incrementLinkClicks(shortCode) {
    const link = this.links.get(shortCode);
    if (link) {
      link.clicks++;
      return link;
    }
    return null;
  }

  getUserLinks(userId) {
    const userLinks = [];
    const now = new Date();
    
    for (const [shortCode, link] of this.links.entries()) {
      // Clean up expired links
      if (link.expiresAt && new Date(link.expiresAt) < now) {
        this.links.delete(shortCode);
        continue;
      }
      
      if (link.userId === userId) {
        userLinks.push(link);
      }
    }
    
    return userLinks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  deleteLink(shortCode, userId) {
    const link = this.links.get(shortCode);
    if (link && link.userId === userId) {
      this.links.delete(shortCode);
      return true;
    }
    return false;
  }

  linkExists(shortCode) {
    return this.links.has(shortCode);
  }
}

module.exports = new Storage();
