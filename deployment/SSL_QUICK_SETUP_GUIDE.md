# Quick Setup Guide - SSL & Nginx Deployment cho 4thitek.vn

## 📋 Tổng quan
Deploy 5 domains với SSL và Nginx:
- 4thitek.vn (Main customer site)
- admin.4thitek.vn (Admin dashboard)
- dealer.4thitek.vn (Dealer portal)
- api.4thitek.vn (API Gateway)
- ws.4thitek.vn (WebSocket Server)

## ✅ Checklist chuẩn bị
- [ ] Server Ubuntu/Debian với quyền root/sudo
- [ ] Wildcard SSL Certificate cho *.4thitek.vn (private key, certificate, CA bundle)
- [ ] DNS đã trỏ tất cả 5 domains về server IP
- [ ] Docker và Docker Compose đã cài đặt

---

## 🚀 BƯỚC 1: Setup SSL Certificates

### 1.1. Kết nối SSH
```bash
ssh root@your-server-ip
```

### 1.2. Tạo thư mục SSL
```bash
# Tạo thư mục chính
sudo mkdir -p /etc/ssl/4thitek.vn

# Tạo symlinks cho subdomains
sudo ln -s /etc/ssl/4thitek.vn /etc/ssl/admin.4thitek.vn
sudo ln -s /etc/ssl/4thitek.vn /etc/ssl/dealer.4thitek.vn
sudo ln -s /etc/ssl/4thitek.vn /etc/ssl/api.4thitek.vn
sudo ln -s /etc/ssl/4thitek.vn /etc/ssl/ws.4thitek.vn

# Set quyền
sudo chmod 700 /etc/ssl/4thitek.vn
```

### 1.3. Upload SSL files
```bash
# Tạo private key
sudo nano /etc/ssl/4thitek.vn/private.key
# Paste nội dung private key, Ctrl+X, Y, Enter

# Tạo certificate
sudo nano /etc/ssl/4thitek.vn/certificate.crt
# Paste nội dung certificate, Ctrl+X, Y, Enter

# Tạo CA bundle
sudo nano /etc/ssl/4thitek.vn/ca-bundle.crt
# Paste nội dung CA bundle, Ctrl+X, Y, Enter
```

### 1.4. Tạo fullchain certificate
```bash
sudo cat /etc/ssl/4thitek.vn/certificate.crt /etc/ssl/4thitek.vn/ca-bundle.crt > /etc/ssl/4thitek.vn/fullchain.crt
```

### 1.5. Set quyền bảo mật
```bash
sudo chmod 600 /etc/ssl/4thitek.vn/private.key
sudo chmod 644 /etc/ssl/4thitek.vn/certificate.crt
sudo chmod 644 /etc/ssl/4thitek.vn/ca-bundle.crt
sudo chmod 644 /etc/ssl/4thitek.vn/fullchain.crt
sudo chown root:root /etc/ssl/4thitek.vn/*
```

### 1.6. Verify SSL (optional)
```bash
# Test private key
sudo openssl rsa -in /etc/ssl/4thitek.vn/private.key -check

# Test certificate
sudo openssl x509 -in /etc/ssl/4thitek.vn/certificate.crt -text -noout

# Verify certificate matches private key
sudo openssl x509 -noout -modulus -in /etc/ssl/4thitek.vn/certificate.crt | openssl md5
sudo openssl rsa -noout -modulus -in /etc/ssl/4thitek.vn/private.key | openssl md5
# Hai output phải GIỐNG NHAU

# Check domains covered
sudo openssl x509 -in /etc/ssl/4thitek.vn/certificate.crt -text -noout | grep -A1 "Subject Alternative Name"
# Phải thấy: DNS:4thitek.vn, DNS:*.4thitek.vn
```

---

## 🚀 BƯỚC 2: Cài đặt Nginx

```bash
sudo apt update
sudo apt install nginx -y
nginx -v
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

---

## 🚀 BƯỚC 3: Verify DNS

```bash
ping 4thitek.vn
ping admin.4thitek.vn
ping dealer.4thitek.vn
ping api.4thitek.vn
ping ws.4thitek.vn
```

**Cần có A records:**
```
Type    Name       Value              TTL
A       @          your-server-ip     3600
A       www        your-server-ip     3600
A       admin      your-server-ip     3600
A       dealer     your-server-ip     3600
A       api        your-server-ip     3600
A       ws         your-server-ip     3600
```

---

## 🚀 BƯỚC 4: Cấu hình Nginx

### 4.1. Tạo shared-config.conf
```bash
sudo nano /etc/nginx/conf.d/shared-config.conf
# Copy & paste toàn bộ nội dung từ file: deployment/nginx/shared-config.conf
# Ctrl+X, Y, Enter để save
```

**File source:** `deployment/nginx/shared-config.conf`

**Nội dung bao gồm:**
- Rate limiting zones (api_limit, general_limit)
- Upstreams: api_backend, main_frontend, admin_frontend, dealer_frontend, notification_ws

### 4.2. Verify nginx.conf includes conf.d/
```bash
grep "conf.d" /etc/nginx/nginx.conf
# Phải thấy: include /etc/nginx/conf.d/*.conf;
```

**Nếu không thấy, thêm vào nginx.conf:**
```bash
sudo nano /etc/nginx/nginx.conf
# Thêm trong block http { ... }:
# include /etc/nginx/conf.d/*.conf;
# include /etc/nginx/sites-enabled/*;
```

### 4.3. Tạo 5 site configs

**⚠️ QUAN TRỌNG:** Khi paste nội dung, XÓA dòng `include shared-config.conf;` nếu có!

```bash
# 1. Main domain
sudo nano /etc/nginx/sites-available/4thitek.vn
# Paste content từ deployment/nginx/4thitek.vn.conf
# XÓA dòng include nếu có

# 2. Admin
sudo nano /etc/nginx/sites-available/admin.4thitek.vn
# Paste content từ deployment/nginx/admin.4thitek.vn.conf
# XÓA dòng include nếu có

# 3. Dealer
sudo nano /etc/nginx/sites-available/dealer.4thitek.vn
# Paste content từ deployment/nginx/dealer.4thitek.vn.conf
# XÓA dòng include nếu có

# 4. API
sudo nano /etc/nginx/sites-available/api.4thitek.vn
# Paste content từ deployment/nginx/api.4thitek.vn.conf
# XÓA dòng include nếu có

# 5. WebSocket
sudo nano /etc/nginx/sites-available/ws.4thitek.vn
# Paste content từ deployment/nginx/ws.4thitek.vn.conf
# XÓA dòng include nếu có
```

### 4.4. Enable sites
```bash
sudo ln -sf /etc/nginx/sites-available/4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/admin.4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/dealer.4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/api.4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/ws.4thitek.vn /etc/nginx/sites-enabled/

# Remove default
sudo rm -f /etc/nginx/sites-enabled/default
```

### 4.5. Test và reload nginx
```bash
# Verify config
sudo nginx -t
# PHẢI thấy: syntax is ok, test is successful

# Reload nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

---

## 🚀 BƯỚC 5: Khởi động Backend Services

```bash
cd /opt/microservice-parent

# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker ps

# Test local connections
curl http://127.0.0.1:8080/actuator/health
curl http://127.0.0.1:3000
curl http://127.0.0.1:9000
curl http://127.0.0.1:5173
curl http://127.0.0.1:8087
```

---

## 🚀 BƯỚC 6: Cấu hình Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status
```

---

## 🧪 BƯỚC 7: Test & Verify

### 7.1. Test từ browser
```
https://4thitek.vn
https://www.4thitek.vn
https://admin.4thitek.vn
https://dealer.4thitek.vn
https://api.4thitek.vn
https://ws.4thitek.vn/ws
```

### 7.2. Test HTTP → HTTPS redirect
```bash
curl -I http://4thitek.vn
curl -I http://admin.4thitek.vn
curl -I http://dealer.4thitek.vn
curl -I http://api.4thitek.vn
curl -I http://ws.4thitek.vn
# Tất cả phải trả về 301 redirect
```

### 7.3. Test SSL
```bash
openssl s_client -connect 4thitek.vn:443 -servername 4thitek.vn
openssl s_client -connect admin.4thitek.vn:443 -servername admin.4thitek.vn
openssl s_client -connect dealer.4thitek.vn:443 -servername dealer.4thitek.vn
openssl s_client -connect api.4thitek.vn:443 -servername api.4thitek.vn
openssl s_client -connect ws.4thitek.vn:443 -servername ws.4thitek.vn
```

### 7.4. Check browser console (F12)
Verify cho mỗi domain:
- ✅ Console: Không có errors
- ✅ Network: API requests thành công (200)
- ✅ Security tab: SSL certificate hợp lệ (green padlock)
- ✅ Không có CORS errors
- ✅ Không có mixed content warnings

---

## ❌ Common Issues & Quick Fixes

### Lỗi 1: "502 Bad Gateway"
```bash
# Check containers
docker ps

# Check ports
sudo netstat -tlnp | grep -E "(3000|9000|5173|8080|8087)"

# Restart containers
docker-compose restart
```

### Lỗi 2: "nginx: [emerg] limit_req_zone is already bound"
**Nguyên nhân:** Có dòng `include shared-config.conf` trong site configs

**Fix:**
```bash
# Verify không có include
grep -r "shared-config" /etc/nginx/sites-enabled/
# Không nên thấy kết quả

# Nếu có, xóa bằng sed
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/4thitek.vn
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/admin.4thitek.vn
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/dealer.4thitek.vn
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/api.4thitek.vn
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/ws.4thitek.vn

# Test lại
sudo nginx -t
sudo systemctl reload nginx
```

### Lỗi 3: "ERR_CONNECTION_REFUSED"
```bash
# Check nginx
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Open ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Lỗi 4: SSL Certificate Invalid
```bash
# Verify certificate
sudo openssl x509 -in /etc/ssl/4thitek.vn/certificate.crt -text -noout | grep -A1 "Subject Alternative Name"

# Re-create fullchain
sudo cat /etc/ssl/4thitek.vn/certificate.crt /etc/ssl/4thitek.vn/ca-bundle.crt > /etc/ssl/4thitek.vn/fullchain.crt

# Reload nginx
sudo systemctl reload nginx
```

---

## 📊 Health Check Commands

```bash
# System
htop
df -h
free -h

# Docker
docker ps
docker-compose logs -f

# Nginx
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Ports
sudo netstat -tlnp | grep -E "(80|443|3000|8080|9000|5173|8087)"

# Test endpoints
curl -I https://4thitek.vn
curl -I https://admin.4thitek.vn
curl -I https://dealer.4thitek.vn
curl -I https://api.4thitek.vn
curl -I https://ws.4thitek.vn

# SSL expiry
echo | openssl s_client -servername 4thitek.vn -connect 4thitek.vn:443 2>/dev/null | openssl x509 -noout -dates
```

---

## ✅ Final Checklist

### SSL & DNS
- [ ] DNS A records configured (@ www admin dealer api ws)
- [ ] SSL certificates uploaded to /etc/ssl/4thitek.vn/
- [ ] Fullchain created
- [ ] File permissions correct (600 for private.key, 644 for others)
- [ ] Certificates verified

### Nginx
- [ ] Nginx installed and running
- [ ] shared-config.conf in /etc/nginx/conf.d/
- [ ] All 5 site configs in sites-available/
- [ ] All 5 symlinks in sites-enabled/
- [ ] NO include shared-config in site configs
- [ ] nginx -t returns OK
- [ ] nginx reloaded successfully

### Backend
- [ ] Docker containers running (5 services)
- [ ] All ports responding locally (3000, 9000, 5173, 8080, 8087)

### Security
- [ ] Firewall configured (80, 443, 22)
- [ ] All domains accessible via HTTPS
- [ ] HTTP redirects to HTTPS (301)
- [ ] SSL certificates valid (green padlock)
- [ ] No browser console errors

### Testing
- [ ] All 5 domains load correctly
- [ ] API Gateway health check OK
- [ ] WebSocket connection works
- [ ] No CORS errors
- [ ] SSL Labs grade A/A+ (optional)

---

## 🔧 Maintenance Commands

```bash
# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
docker-compose logs -f

# Restart services
sudo systemctl restart nginx
docker-compose restart

# Update system
sudo apt update && sudo apt upgrade -y

# Backup SSL
sudo tar -czf ssl-backup-$(date +%Y%m%d).tar.gz /etc/ssl/4thitek.vn/

# Check certificate expiry
sudo openssl x509 -enddate -noout -in /etc/ssl/4thitek.vn/certificate.crt
```

---

## 📞 Important Notes

1. **Private keys** should NEVER be committed to Git or shared publicly
2. **Monitor certificate expiry** - renew 30 days before expiration
3. **Backup** SSL certificates and nginx configs regularly
4. **Test** thoroughly before going live
5. **Document** any custom changes for future reference

---

## 🎯 One-Command Quick Test

```bash
# Run all basic checks at once
echo "=== System ===" && uptime && \
echo "=== Nginx ===" && sudo nginx -t && sudo systemctl status nginx --no-pager && \
echo "=== Docker ===" && docker ps && \
echo "=== Ports ===" && sudo netstat -tlnp | grep -E "(80|443|3000|8080|9000|5173|8087)" && \
echo "=== Firewall ===" && sudo ufw status && \
echo "=== SSL Expiry ===" && echo | openssl s_client -servername 4thitek.vn -connect 4thitek.vn:443 2>/dev/null | openssl x509 -noout -dates
```

---

**File gốc chi tiết:** `SSL_DEPLOYMENT_GUIDE.md`

**Support:** Nếu gặp lỗi, xem phần Troubleshooting trong file gốc hoặc check logs nginx/docker.
