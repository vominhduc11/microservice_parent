# SSL Certificate Setup for 4thitek.vn

## Overview
This directory contains SSL certificate setup scripts for the 4thitek.vn domain.

## Prerequisites

1. **Domain DNS Configuration**: Ensure all subdomains point to your server IP:
   ```
   4thitek.vn           A    YOUR_SERVER_IP
   www.4thitek.vn       A    YOUR_SERVER_IP
   admin.4thitek.vn     A    YOUR_SERVER_IP
   dealer.4thitek.vn    A    YOUR_SERVER_IP
   api.4thitek.vn       A    YOUR_SERVER_IP
   ```

2. **Ports 80 and 443** must be open and accessible from the internet

3. **Email Address**: Update the email in `init-ssl.sh` for Let's Encrypt notifications

## Production Setup (Let's Encrypt)

### First Time Setup

1. SSH into your server
2. Navigate to the reverse-proxy container:
   ```bash
   docker exec -it reverse-proxy sh
   ```

3. Run the SSL initialization script:
   ```bash
   cd /etc/nginx/ssl
   chmod +x init-ssl.sh
   ./init-ssl.sh
   ```

4. Reload nginx:
   ```bash
   nginx -s reload
   ```

### Auto-Renewal

The script automatically sets up a cron job to renew certificates daily at 3 AM. Certbot will only renew certificates that are close to expiration (within 30 days).

To manually renew:
```bash
docker exec -it reverse-proxy certbot renew
docker exec -it reverse-proxy nginx -s reload
```

### Checking Certificate Status

```bash
docker exec -it reverse-proxy openssl x509 -enddate -noout -in /etc/nginx/ssl/4thitek.vn/fullchain.pem
```

## Development Setup (Self-Signed Certificates)

For local development and testing:

1. Generate self-signed certificates:
   ```bash
   docker exec -it reverse-proxy sh -c "chmod +x /etc/nginx/ssl/init-self-signed.sh && /etc/nginx/ssl/init-self-signed.sh"
   ```

2. Reload nginx:
   ```bash
   docker exec -it reverse-proxy nginx -s reload
   ```

⚠ **Note**: Browsers will show security warnings for self-signed certificates. This is normal for development.

## Testing Let's Encrypt (Staging)

Before obtaining production certificates, test with Let's Encrypt staging:

1. Edit `init-ssl.sh` and set `STAGING=1`
2. Run the script
3. Test your setup
4. Set `STAGING=0` and run again for production certificates

## Troubleshooting

### Certificate Already Exists
If certificates exist but you need to replace them:
```bash
docker exec -it reverse-proxy rm -rf /etc/letsencrypt/live/4thitek.vn
docker exec -it reverse-proxy rm -rf /etc/letsencrypt/archive/4thitek.vn
docker exec -it reverse-proxy rm -rf /etc/letsencrypt/renewal/4thitek.vn.conf
```
Then run `init-ssl.sh` again.

### DNS Verification Failed
Ensure your DNS records are properly configured and propagated:
```bash
nslookup 4thitek.vn
nslookup admin.4thitek.vn
nslookup api.4thitek.vn
```

### Port 80 Not Accessible
Certbot needs port 80 for HTTP challenge. Check:
```bash
# On server
netstat -tulpn | grep :80

# Test from outside
curl -I http://4thitek.vn
```

### Rate Limiting
Let's Encrypt has rate limits:
- 50 certificates per domain per week
- Use staging environment for testing

## Certificate Locations

- **Certificates**: `/etc/nginx/ssl/4thitek.vn/`
- **Let's Encrypt data**: `/etc/letsencrypt/`
- **Logs**: `/var/log/letsencrypt/`

## Security Best Practices

1. ✅ Never commit actual certificates to git (already in .gitignore)
2. ✅ Keep privkey.pem permissions at 600
3. ✅ Keep fullchain.pem permissions at 644
4. ✅ Monitor certificate expiration
5. ✅ Use strong SSL ciphers (already configured in nginx.conf)
6. ✅ Enable HSTS (already configured)
7. ✅ Test SSL configuration: https://www.ssllabs.com/ssltest/

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
