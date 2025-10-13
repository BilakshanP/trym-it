// API Base URL
const API_BASE = '/api';

// DOM Elements
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');

// Auth Forms
const loginForm = document.getElementById('loginFormElement');
const registerForm = document.getElementById('registerFormElement');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Auth Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

// App Elements
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const createLinkForm = document.getElementById('createLinkForm');
const linksList = document.getElementById('linksList');
const createLinkError = document.getElementById('createLinkError');
const createLinkSuccess = document.getElementById('createLinkSuccess');

// Storage keys
const TOKEN_KEY = 'authToken';
const USERNAME_KEY = 'username';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Auth tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Login form
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });

    // Register form
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Create link form
    createLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCreateLink();
    });
}

// Switch auth tabs
function switchTab(tab) {
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    authForms.forEach(form => {
        form.classList.toggle('active', form.id === `${tab}Form`);
    });

    // Clear errors
    loginError.classList.remove('show');
    registerError.classList.remove('show');
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem(TOKEN_KEY);
    const username = localStorage.getItem(USERNAME_KEY);

    if (token && username) {
        showApp(username);
        loadLinks();
    } else {
        showAuth();
    }
}

// Show auth section
function showAuth() {
    authSection.style.display = 'block';
    appSection.style.display = 'none';
}

// Show app section
function showApp(username) {
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    usernameDisplay.textContent = `Welcome, ${username}!`;
}

// Handle Login
async function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store token and username
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USERNAME_KEY, data.username);

        // Show app
        showApp(data.username);
        loadLinks();

        // Clear form
        loginForm.reset();
    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.add('show');
    }
}

// Handle Register
async function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Store token and username
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USERNAME_KEY, data.username);

        // Show app
        showApp(data.username);
        loadLinks();

        // Clear form
        registerForm.reset();
    } catch (error) {
        registerError.textContent = error.message;
        registerError.classList.add('show');
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    showAuth();
}

// Handle Create Link
async function handleCreateLink() {
    const url = document.getElementById('urlInput').value;
    const customCode = document.getElementById('customCodeInput').value;
    const expiresInHours = document.getElementById('expiryInput').value;

    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const body = { url };
        if (customCode) body.customCode = customCode;
        if (expiresInHours) body.expiresInHours = parseInt(expiresInHours);

        const response = await fetch(`${API_BASE}/links`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create link');
        }

        // Show success message
        createLinkSuccess.innerHTML = `
            Link created! <a href="${data.link.shortUrl}" target="_blank">${data.link.shortUrl}</a>
        `;
        createLinkSuccess.classList.add('show');
        createLinkError.classList.remove('show');

        // Clear form
        createLinkForm.reset();

        // Reload links
        loadLinks();

        // Hide success message after 5 seconds
        setTimeout(() => {
            createLinkSuccess.classList.remove('show');
        }, 5000);
    } catch (error) {
        createLinkError.textContent = error.message;
        createLinkError.classList.add('show');
        createLinkSuccess.classList.remove('show');
    }
}

// Load Links
async function loadLinks() {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const response = await fetch(`${API_BASE}/links`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to load links');
        }

        renderLinks(data.links);
    } catch (error) {
        linksList.innerHTML = `<p class="error-message show">${error.message}</p>`;
    }
}

// Render Links
function renderLinks(links) {
    if (links.length === 0) {
        linksList.innerHTML = '<p class="loading">No links yet. Create your first short link!</p>';
        return;
    }

    linksList.innerHTML = links.map(link => {
        const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
        const expiryText = link.expiresAt
            ? `Expires: ${new Date(link.expiresAt).toLocaleString()}`
            : 'No expiration';

        return `
            <div class="link-card">
                <div class="link-card-header">
                    <div style="flex: 1;">
                        <div class="link-url">Original: ${escapeHtml(link.url)}</div>
                        <div class="link-short">
                            <a href="${link.shortUrl}" target="_blank">${link.shortUrl}</a>
                            <button class="copy-btn" onclick="copyToClipboard('${link.shortUrl}')">Copy</button>
                        </div>
                    </div>
                    <button class="btn btn-danger" onclick="deleteLink('${link.shortCode}')">Delete</button>
                </div>
                <div class="link-meta">
                    <span>📊 ${link.clicks} clicks</span>
                    <span>📅 Created: ${new Date(link.createdAt).toLocaleString()}</span>
                    <span class="${isExpired ? 'expired' : ''}">⏰ ${expiryText}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Delete Link
async function deleteLink(shortCode) {
    if (!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const response = await fetch(`${API_BASE}/links/${shortCode}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete link');
        }

        // Reload links
        loadLinks();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
