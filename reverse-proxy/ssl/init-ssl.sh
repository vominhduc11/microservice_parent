#!/bin/bash
# SSL Certificate Initialization Script for 4thitek.vn
# This script obtains SSL certificates from Let's Encrypt using Certbot

set -e

DOMAIN="4thitek.vn"
EMAIL="admin@4thitek.vn"  # Change this to your email
STAGING=0  # Set to 1 for testing with Let's Encrypt staging

echo "================================================"
echo "SSL Certificate Setup for $DOMAIN"
echo "================================================"

# Create SSL directory if not exists
mkdir -p /etc/nginx/ssl/$DOMAIN

# Check if certificates already exist
if [ -f "/etc/nginx/ssl/$DOMAIN/fullchain.pem" ]; then
    echo "✓ SSL certificates already exist"
    echo "Certificate expires:"
    openssl x509 -enddate -noout -in /etc/nginx/ssl/$DOMAIN/fullchain.pem

    read -p "Do you want to renew/replace existing certificates? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping certificate generation"
        exit 0
    fi
fi

# Choose staging or production
if [ $STAGING -eq 1 ]; then
    STAGING_ARG="--staging"
    echo "⚠ Using Let's Encrypt STAGING environment (for testing)"
else
    STAGING_ARG=""
    echo "✓ Using Let's Encrypt PRODUCTION environment"
fi

echo ""
echo "Obtaining SSL certificate for:"
echo "  - $DOMAIN"
echo "  - www.$DOMAIN"
echo "  - admin.$DOMAIN"
echo "  - dealer.$DOMAIN"
echo "  - api.$DOMAIN"
echo ""

# Stop nginx temporarily
echo "Stopping nginx..."
nginx -s stop 2>/dev/null || true

# Obtain certificate using certbot standalone mode
certbot certonly \
    $STAGING_ARG \
    --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d admin.$DOMAIN \
    -d dealer.$DOMAIN \
    -d api.$DOMAIN

# Copy certificates to nginx ssl directory
echo "Copying certificates to nginx directory..."
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/$DOMAIN/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/nginx/ssl/$DOMAIN/

# Set proper permissions
chmod 644 /etc/nginx/ssl/$DOMAIN/fullchain.pem
chmod 600 /etc/nginx/ssl/$DOMAIN/privkey.pem

echo ""
echo "================================================"
echo "✓ SSL certificates obtained successfully!"
echo "================================================"
echo ""
echo "Certificate details:"
openssl x509 -text -noout -in /etc/nginx/ssl/$DOMAIN/fullchain.pem | grep -A 2 "Validity"
echo ""

# Setup auto-renewal cron job
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null || true; echo "0 3 * * * certbot renew --quiet --post-hook 'nginx -s reload'") | crontab -

echo "✓ Auto-renewal cron job configured (runs daily at 3 AM)"
echo ""
echo "You can now start nginx with: nginx -g 'daemon off;'"
