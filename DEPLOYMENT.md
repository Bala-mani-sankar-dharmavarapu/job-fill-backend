# Deployment Guide

This guide covers deploying the Job Fill Backend to various production environments.

## Prerequisites

- Node.js 18+ installed on your server
- Groq API key for AI features
- Domain name (optional but recommended)

## Environment Setup

### 1. Production Environment Variables

Create a `.env` file with production settings:

```env
NODE_ENV=production
PORT=5001
GROQ_API_KEY=your_production_groq_api_key
```

### 2. Security Considerations

- Use HTTPS in production
- Set up proper CORS configuration
- Implement rate limiting
- Use environment variables for sensitive data
- Regular security updates

## Deployment Options

### Option 1: Traditional VPS/Server

#### Using PM2 (Recommended)

1. **Install PM2 globally:**

   ```bash
   npm install -g pm2
   ```

2. **Deploy your code:**

   ```bash
   git clone <your-repo>
   cd job-fill-backend
   npm install --production
   ```

3. **Start with PM2:**

   ```bash
   pm2 start server.js --name "job-fill-backend"
   pm2 save
   pm2 startup
   ```

4. **Set up Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Docker Deployment

1. **Build the Docker image:**

   ```bash
   docker build -t job-fill-backend .
   ```

2. **Run the container:**

   ```bash
   docker run -d \
     --name job-fill-backend \
     -p 5001:5001 \
     -e GROQ_API_KEY=your_api_key \
     -e NODE_ENV=production \
     job-fill-backend
   ```

3. **Using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Option 3: Cloud Platforms

#### Heroku

1. **Install Heroku CLI and login:**

   ```bash
   heroku login
   ```

2. **Create Heroku app:**

   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**

   ```bash
   heroku config:set GROQ_API_KEY=your_api_key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

#### Railway

1. **Connect your GitHub repository**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push**

#### Render

1. **Connect your GitHub repository**
2. **Set environment variables:**
   - `GROQ_API_KEY`
   - `NODE_ENV=production`
3. **Deploy automatically**

#### DigitalOcean App Platform

1. **Connect your GitHub repository**
2. **Configure environment variables**
3. **Set build command: `npm install`**
4. **Set run command: `npm start`**

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

1. **Install Certbot:**

   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate:**

   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal:**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Monitoring and Logging

### 1. Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs job-fill-backend

# Restart application
pm2 restart job-fill-backend
```

### 2. Health Checks

The application includes a health check endpoint:

```bash
curl https://your-domain.com/health
```

### 3. Log Rotation

Set up log rotation for production logs:

```bash
# Install logrotate
sudo apt-get install logrotate

# Configure log rotation
sudo nano /etc/logrotate.d/job-fill-backend
```

## Performance Optimization

### 1. Node.js Optimization

```bash
# Use Node.js in production mode
NODE_ENV=production

# Enable clustering for multiple CPU cores
# Add to server.js:
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Your existing server code
}
```

### 2. Caching

Consider implementing Redis for caching:

```javascript
const redis = require("redis");
const client = redis.createClient();

// Cache API responses
app.use("/api/*", async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const cached = await client.get(key);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  next();
});
```

## Backup Strategy

### 1. Code Backup

- Use Git for version control
- Regular pushes to remote repository
- Tag releases for easy rollback

### 2. Environment Backup

- Document all environment variables
- Backup configuration files
- Store secrets securely

## Troubleshooting

### Common Issues

1. **Port already in use:**

   ```bash
   lsof -i :5001
   kill -9 <PID>
   ```

2. **Memory issues:**

   ```bash
   # Monitor memory usage
   pm2 monit

   # Restart if needed
   pm2 restart job-fill-backend
   ```

3. **API key issues:**
   ```bash
   # Test API key
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        https://api.groq.com/openai/v1/models
   ```

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm start
```

## Maintenance

### Regular Tasks

1. **Update dependencies:**

   ```bash
   npm audit
   npm update
   ```

2. **Monitor logs:**

   ```bash
   pm2 logs --lines 100
   ```

3. **Health checks:**

   ```bash
   curl -f https://your-domain.com/health
   ```

4. **Backup verification:**
   - Test restore procedures
   - Verify backup integrity

## Support

For deployment issues:

1. Check the troubleshooting section
2. Review server logs
3. Verify environment variables
4. Test endpoints manually
5. Contact support with error details
