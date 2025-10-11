# 🔗 Trym - URL Shortener

A simple, elegant, and monolithic URL shortener built with Node.js and Express.

## Features

- 🎯 **Shorten URLs**: Convert long URLs into short, shareable links
- 🎨 **Custom Short Codes**: Create personalized short codes for your URLs
- 📊 **Click Tracking**: Monitor how many times your shortened URLs are accessed
- 🚀 **Fast & Lightweight**: Monolithic architecture for quick deployment
- 💾 **In-Memory Storage**: Simple data storage (can be extended to use databases)
- 🎭 **Beautiful UI**: Clean and responsive web interface
- 📡 **RESTful API**: Easy integration with other applications

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BilakshanP/trym-it.git
cd trym-it
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The application will be running at `http://localhost:3000`

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## Usage

### Web Interface

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a long URL in the input field
3. (Optional) Provide a custom short code
4. Click "Shorten URL"
5. Copy and share your shortened URL!

### API Endpoints

#### Shorten a URL

```bash
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "customCode": "mycode"  // optional
}
```

Response:
```json
{
  "success": true,
  "shortUrl": "http://localhost:3000/abc123",
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url"
}
```

#### Get URL Information

```bash
GET /api/url/:shortCode
```

Response:
```json
{
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "createdAt": "2025-10-11T04:18:21.048Z",
  "clicks": 5
}
```

#### Health Check

```bash
GET /api/health
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

#### List All URLs

```bash
GET /api/urls
```

Response:
```json
{
  "urls": [
    {
      "shortCode": "abc123",
      "originalUrl": "https://example.com/url",
      "createdAt": "2025-10-11T04:18:21.048Z",
      "clicks": 5
    }
  ],
  "total": 1
}
```

#### Redirect to Original URL

Simply visit the short URL:
```bash
GET /:shortCode
```

This will redirect you to the original URL and increment the click counter.

## Architecture

Trym follows a **monolithic architecture** where all components are part of a single application:

- **Backend**: Express.js server handling API requests and redirects
- **Frontend**: Static HTML/CSS/JavaScript files served by Express
- **Storage**: In-memory Map for storing URL mappings

```
┌─────────────────────────────────────┐
│         Trym Monolith               │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Frontend   │  │   Backend   │ │
│  │  (HTML/CSS)  │  │  (Express)  │ │
│  └──────────────┘  └─────────────┘ │
│                                     │
│         ┌────────────┐              │
│         │  Storage   │              │
│         │ (In-Memory)│              │
│         └────────────┘              │
└─────────────────────────────────────┘
```

## Project Structure

```
trym-it/
├── public/
│   ├── index.html      # Main web interface
│   ├── styles.css      # Styling
│   └── script.js       # Client-side JavaScript
├── server.js           # Express server and API
├── package.json        # Dependencies and scripts
├── .gitignore         # Git ignore rules
└── README.md          # Documentation
```

## Configuration

The server can be configured using environment variables:

- `PORT`: Server port (default: 3000)

Example:
```bash
PORT=8080 npm start
```

## Limitations

- **In-Memory Storage**: Data is lost when the server restarts. For production use, consider integrating a database (MongoDB, PostgreSQL, Redis, etc.)
- **No Authentication**: Currently, anyone can create shortened URLs
- **No URL Expiration**: URLs don't expire automatically
- **No Rate Limiting**: No protection against abuse

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication and authorization
- [ ] URL expiration dates
- [ ] Rate limiting
- [ ] Analytics dashboard
- [ ] QR code generation
- [ ] Custom domains
- [ ] URL validation and safety checks
- [ ] API key authentication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Built with ❤️ as a learning project for monolithic application architecture.