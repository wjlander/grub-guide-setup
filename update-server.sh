#!/bin/bash

# UK Meal Planner - Server Update Script
# This script updates the deployed application with the latest changes

set -e  # Exit on any error

echo "🔄 UK Meal Planner - Server Update Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/meal-planner"
WEB_ROOT="/var/www/html"
BACKUP_DIR="/opt/meal-planner/backups"

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root or with sudo"
   exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required commands
print_status "Checking system requirements..."
MISSING_COMMANDS=()

if ! command_exists git; then
    MISSING_COMMANDS+=("git")
fi

if ! command_exists node; then
    MISSING_COMMANDS+=("nodejs")
fi

if ! command_exists npm; then
    MISSING_COMMANDS+=("npm")
fi

if ! command_exists nginx; then
    MISSING_COMMANDS+=("nginx")
fi

if [ ${#MISSING_COMMANDS[@]} -ne 0 ]; then
    print_error "Missing required commands: ${MISSING_COMMANDS[*]}"
    print_error "Please run the initial install script first"
    exit 1
fi

print_success "All required commands found"

# Create backup of current deployment
print_status "Creating backup of current deployment..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

if [ -d "$WEB_ROOT" ]; then
    cp -r "$WEB_ROOT" "$BACKUP_DIR/$BACKUP_NAME"
    print_success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
else
    print_warning "No existing deployment found to backup"
fi

# Navigate to app directory
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found: $APP_DIR"
    print_error "Please run the initial install script first"
    exit 1
fi

cd "$APP_DIR"

# Stash any local changes
print_status "Stashing any local changes..."
git stash push -m "Auto-stash before update $TIMESTAMP" || true

# Pull latest changes
print_status "Pulling latest changes from repository..."
if ! git pull origin main; then
    print_error "Failed to pull latest changes"
    print_error "You may need to resolve conflicts manually"
    exit 1
fi

print_success "Latest changes pulled successfully"

# Install/update dependencies
print_status "Installing/updating dependencies..."
if ! npm ci --production; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully"

# Build the application
print_status "Building the application..."
if ! npm run build; then
    print_error "Failed to build the application"
    print_error "Check the build logs above for details"
    
    # Restore from backup if build fails
    if [ -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
        print_warning "Restoring from backup due to build failure..."
        rm -rf "$WEB_ROOT"/*
        cp -r "$BACKUP_DIR/$BACKUP_NAME"/* "$WEB_ROOT/"
        print_success "Backup restored"
    fi
    
    exit 1
fi

print_success "Application built successfully"

# Deploy the built files
print_status "Deploying built files..."

# Remove old files but keep .htaccess and other important files
find "$WEB_ROOT" -type f ! -name '.htaccess' ! -name 'robots.txt' -delete 2>/dev/null || true
find "$WEB_ROOT" -type d -empty -delete 2>/dev/null || true

# Copy new files
if ! cp -r dist/* "$WEB_ROOT/"; then
    print_error "Failed to copy built files"
    
    # Restore from backup if deployment fails
    if [ -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
        print_warning "Restoring from backup due to deployment failure..."
        rm -rf "$WEB_ROOT"/*
        cp -r "$BACKUP_DIR/$BACKUP_NAME"/* "$WEB_ROOT/"
        print_success "Backup restored"
    fi
    
    exit 1
fi

print_success "Files deployed successfully"

# Set proper permissions
print_status "Setting file permissions..."
chown -R www-data:www-data "$WEB_ROOT"
find "$WEB_ROOT" -type f -exec chmod 644 {} \;
find "$WEB_ROOT" -type d -exec chmod 755 {} \;

print_success "Permissions set correctly"

# Test Nginx configuration
print_status "Testing Nginx configuration..."
if ! nginx -t; then
    print_error "Nginx configuration test failed"
    exit 1
fi

print_success "Nginx configuration is valid"

# Reload Nginx
print_status "Reloading Nginx..."
if ! systemctl reload nginx; then
    print_error "Failed to reload Nginx"
    exit 1
fi

print_success "Nginx reloaded successfully"

# Clean up old backups (keep last 5)
print_status "Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t | tail -n +6 | xargs -r rm -rf
print_success "Old backups cleaned up"

# Final verification
print_status "Performing final verification..."

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    print_error "Nginx is not running"
    exit 1
fi

# Check if files are accessible
if [ ! -f "$WEB_ROOT/index.html" ]; then
    print_error "index.html not found in web root"
    exit 1
fi

print_success "All checks passed"

# Display completion message
echo ""
echo "🎉 Update Complete!"
echo "=================="
echo "✅ Repository updated with latest changes"
echo "✅ Dependencies updated"
echo "✅ Application rebuilt and deployed"
echo "✅ Nginx configuration reloaded"
echo "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME"
echo ""

# Display access information
DOMAIN_NAME=$(grep -o 'server_name [^;]*' /etc/nginx/sites-available/meal-planner 2>/dev/null | cut -d' ' -f2 | head -n1)

if [[ -n "$DOMAIN_NAME" && "$DOMAIN_NAME" != "_" ]]; then
    echo "🌐 Your updated application is available at: https://$DOMAIN_NAME"
else
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
    echo "🌐 Your updated application is available at: http://$SERVER_IP"
fi

echo ""
echo "📋 Useful commands:"
echo "  - View Nginx status: sudo systemctl status nginx"
echo "  - View Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  - Rollback to backup: sudo cp -r $BACKUP_DIR/$BACKUP_NAME/* $WEB_ROOT/"
echo ""

print_success "Update completed successfully!"