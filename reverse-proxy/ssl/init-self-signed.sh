#!/bin/bash
# Self-signed SSL Certificate Generator for Development/Testing
# Use this for local testing before deploying to production

set -e

DOMAIN="4thitek.vn"
DAYS=365

echo "================================================"
echo "Generating Self-Signed SSL Certificates"
echo "⚠ FOR DEVELOPMENT/TESTING ONLY"
echo "================================================"

# Create SSL directory
mkdir -p /etc/nginx/ssl/$DOMAIN

# Generate self-signed certificate
openssl req -x509 -nodes -days $DAYS \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/$DOMAIN/privkey.pem \
    -out /etc/nginx/ssl/$DOMAIN/fullchain.pem \
    -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=4ThiTek/OU=IT/CN=$DOMAIN" \
    -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN,DNS:admin.$DOMAIN,DNS:dealer.$DOMAIN,DNS:api.$DOMAIN"

# Set proper permissions
chmod 644 /etc/nginx/ssl/$DOMAIN/fullchain.pem
chmod 600 /etc/nginx/ssl/$DOMAIN/privkey.pem

echo ""
echo "================================================"
echo "✓ Self-signed certificates generated!"
echo "================================================"
echo ""
echo "Certificate valid for: $DAYS days"
echo "Location: /etc/nginx/ssl/$DOMAIN/"
echo ""
echo "⚠ WARNING: Browsers will show security warnings"
echo "Use this ONLY for development/testing"
echo "For production, use Let's Encrypt (init-ssl.sh)"
echo ""
