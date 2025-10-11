// Load stats on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
});

// Handle form submission
document.getElementById('shortenForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const originalUrl = document.getElementById('originalUrl').value;
    const customCode = document.getElementById('customCode').value;
    
    // Hide previous results/errors
    document.getElementById('result').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    
    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: originalUrl,
                customCode: customCode || undefined
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Display success result
            document.getElementById('shortUrl').value = data.shortUrl;
            document.getElementById('originalUrlDisplay').textContent = data.originalUrl;
            document.getElementById('shortCodeDisplay').textContent = data.shortCode;
            document.getElementById('result').classList.remove('hidden');
            
            // Clear form
            document.getElementById('originalUrl').value = '';
            document.getElementById('customCode').value = '';
            
            // Reload stats
            loadStats();
        } else {
            // Display error
            showError(data.error || 'Failed to shorten URL');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
});

// Copy to clipboard function
function copyToClipboard() {
    const shortUrlInput = document.getElementById('shortUrl');
    shortUrlInput.select();
    shortUrlInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        
        // Change button text temporarily
        const copyBtn = event.target;
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        showError('Failed to copy to clipboard');
    }
}

// Show error message
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('error').classList.remove('hidden');
}

// Load and display stats
async function loadStats() {
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            const data = await response.json();
            document.getElementById('totalUrls').textContent = data.stats.totalUrls;
            document.getElementById('totalRedirects').textContent = data.stats.totalRedirects;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}
