# Trym Usage Examples

## Command Line Examples

### 1. Basic URL Shortening

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/BilakshanP/trym-it"}'
```

Response:
```json
{
  "success": true,
  "shortUrl": "http://localhost:3000/abc123",
  "shortCode": "abc123",
  "originalUrl": "https://github.com/BilakshanP/trym-it"
}
```

### 2. Custom Short Code

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very/long/url",
    "customCode": "mylink"
  }'
```

Response:
```json
{
  "success": true,
  "shortUrl": "http://localhost:3000/mylink",
  "shortCode": "mylink",
  "originalUrl": "https://example.com/very/long/url"
}
```

### 3. Get URL Information

```bash
curl http://localhost:3000/api/url/mylink
```

Response:
```json
{
  "shortCode": "mylink",
  "originalUrl": "https://example.com/very/long/url",
  "createdAt": "2025-10-11T04:18:21.048Z",
  "clicks": 5
}
```

### 4. List All URLs

```bash
curl http://localhost:3000/api/urls
```

Response:
```json
{
  "urls": [
    {
      "shortCode": "abc123",
      "originalUrl": "https://github.com/BilakshanP/trym-it",
      "createdAt": "2025-10-11T04:18:21.048Z",
      "clicks": 3
    },
    {
      "shortCode": "mylink",
      "originalUrl": "https://example.com/very/long/url",
      "createdAt": "2025-10-11T04:20:15.123Z",
      "clicks": 5
    }
  ],
  "total": 2
}
```

### 5. Check Service Health

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "service": "Trym URL Shortener",
  "stats": {
    "totalUrls": 10,
    "totalRedirects": 25
  }
}
```

### 6. Test Redirect

```bash
curl -I http://localhost:3000/mylink
```

Response:
```
HTTP/1.1 302 Found
Location: https://example.com/very/long/url
```

## JavaScript Examples

### Using Fetch API

```javascript
// Shorten a URL
async function shortenUrl(originalUrl, customCode = null) {
  const response = await fetch('http://localhost:3000/api/shorten', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: originalUrl,
      customCode: customCode
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('Short URL:', data.shortUrl);
    return data;
  } else {
    console.error('Error:', data.error);
    throw new Error(data.error);
  }
}

// Usage
shortenUrl('https://example.com/page', 'mycode')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Get URL Statistics

```javascript
async function getUrlStats(shortCode) {
  const response = await fetch(`http://localhost:3000/api/url/${shortCode}`);
  const data = await response.json();
  
  if (response.ok) {
    console.log(`Original URL: ${data.originalUrl}`);
    console.log(`Clicks: ${data.clicks}`);
    console.log(`Created: ${data.createdAt}`);
    return data;
  } else {
    console.error('Error:', data.error);
    throw new Error(data.error);
  }
}

// Usage
getUrlStats('mycode')
  .then(stats => console.log(stats))
  .catch(error => console.error(error));
```

## Python Examples

### Using Requests Library

```python
import requests

# Shorten a URL
def shorten_url(url, custom_code=None):
    payload = {
        'url': url
    }
    
    if custom_code:
        payload['customCode'] = custom_code
    
    response = requests.post(
        'http://localhost:3000/api/shorten',
        json=payload
    )
    
    if response.ok:
        data = response.json()
        print(f"Short URL: {data['shortUrl']}")
        return data
    else:
        print(f"Error: {response.json()['error']}")
        return None

# Usage
result = shorten_url('https://example.com/page', 'pycode')
print(result)

# Get URL information
def get_url_info(short_code):
    response = requests.get(
        f'http://localhost:3000/api/url/{short_code}'
    )
    
    if response.ok:
        return response.json()
    else:
        print(f"Error: {response.json()['error']}")
        return None

# Usage
info = get_url_info('pycode')
print(info)
```

## Error Handling Examples

### Invalid URL

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "not-a-valid-url"}'
```

Response:
```json
{
  "error": "Invalid URL format"
}
```

### Duplicate Custom Code

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "customCode": "existing"
  }'
```

Response (if "existing" already exists):
```json
{
  "error": "Custom code already exists"
}
```

### Invalid Custom Code Format

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "customCode": "my-code!"
  }'
```

Response:
```json
{
  "error": "Custom code must be alphanumeric"
}
```

### Non-existent Short Code

```bash
curl http://localhost:3000/api/url/nonexistent
```

Response:
```json
{
  "error": "Short URL not found"
}
```

## Integration Examples

### Express.js Integration

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Middleware to shorten URLs in your app
app.post('/create-short-link', async (req, res) => {
  const { originalUrl } = req.body;
  
  try {
    const response = await fetch('http://localhost:3000/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: originalUrl })
    });
    
    const data = await response.json();
    res.json({ shortLink: data.shortUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create short link' });
  }
});

app.listen(8080, () => {
  console.log('App running on port 8080');
});
```

### React Component Example

```jsx
import React, { useState } from 'react';

function UrlShortener() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShortUrl(data.shortUrl);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          required
        />
        <button type="submit">Shorten</button>
      </form>
      
      {shortUrl && <p>Short URL: {shortUrl}</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}

export default UrlShortener;
```

## Testing Examples

### Load Testing with Apache Bench

```bash
# Create 100 requests with 10 concurrent connections
ab -n 100 -c 10 -p data.json -T application/json http://localhost:3000/api/shorten
```

### Automated Testing Script

```bash
#!/bin/bash

echo "Testing Trym URL Shortener..."

# Test 1: Health check
echo "Test 1: Health Check"
curl -s http://localhost:3000/api/health | grep -q "ok" && echo "✓ PASS" || echo "✗ FAIL"

# Test 2: Create short URL
echo "Test 2: Create Short URL"
RESULT=$(curl -s -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://test.com"}')
echo $RESULT | grep -q "success" && echo "✓ PASS" || echo "✗ FAIL"

# Test 3: Get URL info
echo "Test 3: Get URL Info"
SHORT_CODE=$(echo $RESULT | grep -oP '"shortCode":"\K[^"]+')
curl -s http://localhost:3000/api/url/$SHORT_CODE | grep -q "test.com" && echo "✓ PASS" || echo "✗ FAIL"

echo "All tests completed!"
```
