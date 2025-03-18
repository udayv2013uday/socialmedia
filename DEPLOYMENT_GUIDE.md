# Social Media Application Deployment Guide for RedHat VM

This guide provides step-by-step instructions for deploying the Social Media application on a RedHat VM.

## Prerequisites

- RedHat VM with administrative access
- Node.js (v16.x or later) and npm (v8.x or later)
- PostgreSQL (v12 or later)
- Git

## Step 1: Install Required Software

Update your system and install the required dependencies:

```bash
# Update system
sudo dnf update -y

# Install Node.js and npm
sudo dnf install -y nodejs npm

# Install PostgreSQL
sudo dnf install -y postgresql postgresql-server postgresql-contrib

# Initialize PostgreSQL database
sudo postgresql-setup --initdb

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Clone the Application

```bash
# Create a directory for the application
mkdir -p /opt/socialmedia
cd /opt/socialmedia

# Clone the application code from your repository
# Replace with your actual repository URL
git clone https://your-repository-url.git .
```

## Step 3: Configure PostgreSQL

```bash
# Log in to PostgreSQL
sudo -u postgres psql

# Create a database and user
CREATE DATABASE socialmedia;
CREATE USER socialmediauser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE socialmedia TO socialmediauser;

# Exit PostgreSQL
\q
```

## Step 4: Configure the Application

Create a `.env` file in the root directory:

```bash
cd /opt/socialmedia
cat > .env << EOL
DATABASE_URL=postgresql://socialmediauser:your_secure_password@localhost:5432/socialmedia
PORT=3000
SESSION_SECRET=your_secure_session_secret
EOL
```

## Step 5: Install Dependencies and Build the Application

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

## Step 6: Set Up Database Schema

```bash
# Run database migrations
npx drizzle-kit push:pg
```

## Step 7: Configure the Application as a Service

Create a systemd service file:

```bash
sudo cat > /etc/systemd/system/socialmedia.service << EOL
[Unit]
Description=Social Media Application
After=network.target postgresql.service

[Service]
Type=simple
User=nobody
WorkingDirectory=/opt/socialmedia
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd, enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable socialmedia
sudo systemctl start socialmedia
```

## Step 8: Configure Firewall (if needed)

```bash
# Allow traffic on the application port (default is 3000)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## Step 9: Set Up Nginx as a Reverse Proxy (Optional but Recommended)

Install and configure Nginx:

```bash
# Install Nginx
sudo dnf install -y nginx

# Create Nginx configuration file
sudo cat > /etc/nginx/conf.d/socialmedia.conf << EOL
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Test Nginx configuration
sudo nginx -t

# If the test passes, restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall to allow HTTP traffic
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

## Step 10: SSL Configuration (Optional but Recommended)

For secure HTTPS connections, consider setting up Let's Encrypt:

```bash
# Install Certbot
sudo dnf install -y certbot python3-certbot-nginx

# Obtain and install a certificate
sudo certbot --nginx -d your-domain.com

# Certbot will modify your Nginx configuration automatically
# Configure firewall to allow HTTPS traffic
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Maintenance and Troubleshooting

### Check Application Status
```bash
sudo systemctl status socialmedia
```

### View Application Logs
```bash
sudo journalctl -u socialmedia
```

### Restart the Application
```bash
sudo systemctl restart socialmedia
```

### Update the Application
```bash
cd /opt/socialmedia
git pull
npm install
npm run build
sudo systemctl restart socialmedia
```

## Security Considerations

1. Always use strong passwords for your database and session secret
2. Keep your server updated with security patches
3. Consider implementing HTTPS using Let's Encrypt
4. Set up a firewall to restrict access to only necessary ports
5. Use a non-root user to run the application

## Backup Strategy

1. Regularly backup your PostgreSQL database:
```bash
pg_dump -U socialmediauser -d socialmedia > backup.sql
```

2. Schedule automated backups using cron jobs
3. Store backups in a separate location or cloud storage