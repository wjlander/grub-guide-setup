#!/bin/bash

# UK Meal Planner - Ubuntu/Debian Server Installation Script
# This script installs and configures the meal planning app on Ubuntu/Debian

set -e  # Exit on any error

echo "🍽️  UK Meal Planner Server Installation Script"
echo "=============================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Install Node.js (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
echo "✅ Verifying installations..."
node_version=$(node --version)
npm_version=$(npm --version)
echo "Node.js version: $node_version"
echo "NPM version: $npm_version"

# Create application directory
APP_DIR="/var/www/meal-planner"
echo "📁 Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or setup application (user will need to provide their repository)
echo "📥 Setting up application..."
echo "⚠️  You'll need to either:"
echo "   1. Clone your repository: git clone <your-repo-url> $APP_DIR"
echo "   2. Upload your built application files to: $APP_DIR"

read -p "Do you have a Git repository URL? (y/N): " has_repo
if [[ $has_repo =~ ^[Yy]$ ]]; then
    read -p "Enter your Git repository URL: " repo_url
    if [[ -n "$repo_url" ]]; then
        git clone "$repo_url" "$APP_DIR"
        cd "$APP_DIR"
    else
        echo "❌ No repository URL provided. You'll need to manually upload files to $APP_DIR"
        cd "$APP_DIR"
    fi
else
    echo "📋 Please upload your application files to: $APP_DIR"
    echo "   You can use scp, rsync, or any file transfer method"
    read -p "Press Enter when files are uploaded..."
    cd "$APP_DIR"
fi

# Install dependencies and build (if package.json exists)
if [[ -f "package.json" ]]; then
    echo "📦 Installing application dependencies..."
    npm install
    
    echo "🏗️  Building application..."
    npm run build
    
    # Move build files to nginx directory
    sudo rm -rf /var/www/html/*
    sudo cp -r dist/* /var/www/html/
else
    echo "⚠️  No package.json found. Please ensure your built files are in /var/www/html/"
fi

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/meal-planner > /dev/null <<EOL
server {
    listen 80;
    server_name localhost;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOL

# Enable the site
sudo ln -sf /etc/nginx/sites-available/meal-planner /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Start and enable services
echo "🚀 Starting services..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Environment setup
echo "🔧 Setting up environment..."
sudo tee /etc/systemd/system/meal-planner-env.service > /dev/null <<EOL
[Unit]
Description=Meal Planner Environment Setup
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/true

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl enable meal-planner-env.service

# Create maintenance scripts
echo "🛠️  Creating maintenance scripts..."
sudo mkdir -p /opt/meal-planner

# Update script
sudo tee /opt/meal-planner/update.sh > /dev/null <<'EOL'
#!/bin/bash
# Update script for Meal Planner

set -e

APP_DIR="/var/www/meal-planner"
BACKUP_DIR="/opt/meal-planner/backups"

echo "🔄 Updating Meal Planner..."

# Create backup
mkdir -p "$BACKUP_DIR"
backup_name="backup_$(date +%Y%m%d_%H%M%S)"
cp -r /var/www/html "$BACKUP_DIR/$backup_name"
echo "📦 Backup created: $BACKUP_DIR/$backup_name"

# Update application
cd "$APP_DIR"
git pull origin main
npm install
npm run build

# Deploy new build
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# Restart nginx
sudo systemctl reload nginx

echo "✅ Update completed successfully!"
EOL

sudo chmod +x /opt/meal-planner/update.sh

# Backup script
sudo tee /opt/meal-planner/backup.sh > /dev/null <<'EOL'
#!/bin/bash
# Backup script for Meal Planner

BACKUP_DIR="/opt/meal-planner/backups"
mkdir -p "$BACKUP_DIR"

backup_name="manual_backup_$(date +%Y%m%d_%H%M%S)"
cp -r /var/www/html "$BACKUP_DIR/$backup_name"

echo "📦 Manual backup created: $BACKUP_DIR/$backup_name"

# Keep only last 10 backups
cd "$BACKUP_DIR"
ls -t | tail -n +11 | xargs -r rm -rf

echo "✅ Backup completed and old backups cleaned up!"
EOL

sudo chmod +x /opt/meal-planner/backup.sh

# SSL Certificate setup (optional)
echo ""
echo "🔒 SSL Certificate Setup"
echo "========================"
read -p "Do you want to set up SSL with Let's Encrypt? (y/N): " setup_ssl
if [[ $setup_ssl =~ ^[Yy]$ ]]; then
    read -p "Enter your domain name (e.g., mealplanner.example.com): " domain_name
    if [[ -n "$domain_name" ]]; then
        # Update nginx config with domain
        sudo sed -i "s/server_name localhost;/server_name $domain_name;/" /etc/nginx/sites-available/meal-planner
        sudo nginx -t && sudo systemctl reload nginx
        
        # Get SSL certificate
        sudo certbot --nginx -d "$domain_name" --non-interactive --agree-tos --email admin@"$domain_name"
        
        # Setup auto-renewal
        echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    fi
fi

# Setup log rotation
sudo tee /etc/logrotate.d/meal-planner > /dev/null <<EOL
/var/log/nginx/access.log /var/log/nginx/error.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        sudo systemctl reload nginx
    endscript
}
EOL

# Final status check and debugging
echo ""
echo "🎉 Installation Complete!"
echo "========================="
echo "✅ Application installed in: $APP_DIR"
echo "✅ Web root: /var/www/html"
echo "✅ Nginx configuration: /etc/nginx/sites-available/meal-planner"
echo "✅ Update script: /opt/meal-planner/update.sh"
echo "✅ Backup script: /opt/meal-planner/backup.sh"
echo ""

# Debug information
echo "🔍 Debug Information:"
echo "===================="
echo "Nginx status: $(sudo systemctl is-active nginx)"
echo "Files in web root:"
ls -la /var/www/html/
echo ""
echo "Nginx error log (last 5 lines):"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "No error log found"
echo ""

# Display access information
if [[ -n "$domain_name" ]]; then
    echo "🌐 Your application is available at: https://$domain_name"
else
    server_ip=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")
    echo "🌐 Your application is available at: http://$server_ip"
fi

echo ""
echo "📋 Next Steps:"
echo "1. If you haven't already, upload your built application files to /var/www/html"
echo "2. Configure your domain DNS to point to this server"
echo "3. Set up regular backups: sudo crontab -e and add: 0 2 * * * /opt/meal-planner/backup.sh"
echo "4. Monitor logs: sudo tail -f /var/log/nginx/access.log"
echo ""
echo "🛠️  Maintenance Commands:"
echo "- Update app: sudo /opt/meal-planner/update.sh"
echo "- Create backup: sudo /opt/meal-planner/backup.sh"
echo "- Check status: sudo systemctl status nginx"
echo "- View logs: sudo journalctl -u nginx -f"
echo ""
echo "🔐 Security Notes:"
echo "- Firewall is enabled (UFW)"
echo "- Security headers are configured"
echo "- HTTPS is recommended for production"
echo ""

echo "Installation completed successfully! 🎉"