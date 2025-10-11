# Hướng dẫn Deploy SSL Certificate cho 4thitek.vn - Multi-Domain Setup

## 📋 Tổng quan

Hệ thống bao gồm 5 domains/subdomains độc lập:
- **4thitek.vn** (www.4thitek.vn) - Main customer website (Next.js on port 3000)
- **admin.4thitek.vn** - Admin dashboard (React on port 9000)
- **dealer.4thitek.vn** - Dealer portal (React on port 5173)
- **api.4thitek.vn** - API Gateway (Spring Boot on port 8080)
- **ws.4thitek.vn** - WebSocket Server (Notification Service on port 8087) ⭐ NEW

Mỗi domain có:
- ✅ SSL certificate riêng (hoặc dùng wildcard cert)
- ✅ Nginx config file riêng
- ✅ Có thể enable/disable độc lập

**Lợi ích của api.4thitek.vn:**
- ✅ Endpoint API chuyên nghiệp, chuẩn REST
- ✅ CORS đơn giản hơn (tất cả frontends call cùng 1 endpoint)
- ✅ Hỗ trợ mobile apps, third-party integrations
- ✅ API documentation có thể public tại `/docs`
- ✅ Monitoring và rate limiting riêng cho API

**Lợi ích của ws.4thitek.vn:**
- ✅ WebSocket endpoint chuyên dụng cho real-time notifications
- ✅ Tách biệt traffic WebSocket khỏi REST API (tối ưu performance)
- ✅ Timeout và buffering settings riêng cho long-lived connections
- ✅ Dễ dàng scale WebSocket server độc lập
- ✅ Security: Chỉ cho phép endpoint `/ws`, reject các path khác

---

## 📋 Những gì bạn cần chuẩn bị

### Option 1: Wildcard SSL Certificate (Khuyến nghị - Dễ nhất)
Mua 1 Wildcard SSL cho `*.4thitek.vn` sẽ cover tất cả subdomains:
- ✅ 4thitek.vn
- ✅ www.4thitek.vn
- ✅ admin.4thitek.vn
- ✅ dealer.4thitek.vn
- ✅ api.4thitek.vn
- ✅ ws.4thitek.vn
- ✅ Bất kỳ subdomain nào khác

**Files nhận được:**
1. Private Key (`.key`)
2. Certificate (`.crt` hoặc `.cer`)
3. CA Bundle (`.ca-bundle` hoặc `.crt`)

### Option 2: Multi-Domain SSL (SAN Certificate)
Mua SSL certificate với Subject Alternative Names bao gồm tất cả domains cần thiết.

### Option 3: Separate Certificates (Không khuyến nghị)
Mua 3 SSL certificates riêng cho từng domain (tốn kém và phức tạp hơn).

### Option 4: Let's Encrypt (Free - Cho staging/testing)
Miễn phí nhưng chỉ valid 90 ngày, cần auto-renew.

---

## 🚀 BƯỚC 1: Chuẩn bị files trên server

### 1.1. Kết nối vào server cloud

```bash
ssh root@your-server-ip
# Hoặc
ssh username@your-server-ip
```

### 1.2. Tạo thư mục lưu trữ SSL certificates

#### Nếu dùng Wildcard Certificate (Option 1):

```bash
# Tạo thư mục chung cho wildcard cert
sudo mkdir -p /etc/ssl/4thitek.vn

# Tạo symlinks cho subdomains (để nginx config nhất quán)
sudo ln -s /etc/ssl/4thitek.vn /etc/ssl/admin.4thitek.vn
sudo ln -s /etc/ssl/4thitek.vn /etc/ssl/dealer.4thitek.vn
sudo ln -s /etc/ssl/4thitek.vn /etc/ssl/api.4thitek.vn
sudo ln -s /etc/ssl/4thitek.vn /etc/ssl/ws.4thitek.vn

# Set quyền bảo mật
sudo chmod 700 /etc/ssl/4thitek.vn
```

#### Nếu dùng Separate Certificates (Option 3):

```bash
# Tạo thư mục riêng cho từng domain
sudo mkdir -p /etc/ssl/4thitek.vn
sudo mkdir -p /etc/ssl/admin.4thitek.vn
sudo mkdir -p /etc/ssl/dealer.4thitek.vn
sudo mkdir -p /etc/ssl/api.4thitek.vn
sudo mkdir -p /etc/ssl/ws.4thitek.vn

# Set quyền bảo mật
sudo chmod 700 /etc/ssl/4thitek.vn
sudo chmod 700 /etc/ssl/admin.4thitek.vn
sudo chmod 700 /etc/ssl/dealer.4thitek.vn
sudo chmod 700 /etc/ssl/api.4thitek.vn
sudo chmod 700 /etc/ssl/ws.4thitek.vn
```

### 1.3. Upload các file SSL lên server

**Copy-paste nội dung qua SSH terminal:**

```bash
# Tạo file private key
sudo nano /etc/ssl/4thitek.vn/private.key
# Paste nội dung private key vào (bắt đầu với -----BEGIN PRIVATE KEY-----)
# Ctrl+X, Y, Enter để save

# Tạo file certificate
sudo nano /etc/ssl/4thitek.vn/certificate.crt
# Paste nội dung certificate vào
# Ctrl+X, Y, Enter để save

# Tạo file CA bundle
sudo nano /etc/ssl/4thitek.vn/ca-bundle.crt
# Paste nội dung CA bundle vào
# Ctrl+X, Y, Enter để save
```

### 1.4. Tạo fullchain certificate (Kết hợp cert + CA bundle)

Nginx cần file fullchain (certificate + CA bundle trong 1 file):

```bash
# For main domain
sudo cat /etc/ssl/4thitek.vn/certificate.crt /etc/ssl/4thitek.vn/ca-bundle.crt > /etc/ssl/4thitek.vn/fullchain.crt

# If using separate certs for subdomains, repeat for each:
# sudo cat /etc/ssl/admin.4thitek.vn/certificate.crt /etc/ssl/admin.4thitek.vn/ca-bundle.crt > /etc/ssl/admin.4thitek.vn/fullchain.crt
# sudo cat /etc/ssl/dealer.4thitek.vn/certificate.crt /etc/ssl/dealer.4thitek.vn/ca-bundle.crt > /etc/ssl/dealer.4thitek.vn/fullchain.crt
```

### 1.5. Set quyền bảo mật cho các files

```bash
# Main domain
sudo chmod 600 /etc/ssl/4thitek.vn/private.key
sudo chmod 644 /etc/ssl/4thitek.vn/certificate.crt
sudo chmod 644 /etc/ssl/4thitek.vn/ca-bundle.crt
sudo chmod 644 /etc/ssl/4thitek.vn/fullchain.crt
sudo chown root:root /etc/ssl/4thitek.vn/*

# If using separate certs, repeat for admin and dealer directories
```

### 1.6. Verify các files SSL

```bash
# Kiểm tra private key
sudo openssl rsa -in /etc/ssl/4thitek.vn/private.key -check

# Kiểm tra certificate
sudo openssl x509 -in /etc/ssl/4thitek.vn/certificate.crt -text -noout

# Kiểm tra certificate khớp với private key
sudo openssl x509 -noout -modulus -in /etc/ssl/4thitek.vn/certificate.crt | openssl md5
sudo openssl rsa -noout -modulus -in /etc/ssl/4thitek.vn/private.key | openssl md5
# Hai output phải GIỐNG NHAU

# Kiểm tra certificate có cover đủ domains không
sudo openssl x509 -in /etc/ssl/4thitek.vn/certificate.crt -text -noout | grep -A1 "Subject Alternative Name"
# Phải thấy: DNS:4thitek.vn, DNS:*.4thitek.vn (nếu wildcard)
# Hoặc: DNS:4thitek.vn, DNS:www.4thitek.vn, DNS:admin.4thitek.vn, DNS:dealer.4thitek.vn
```

---

## 🚀 BƯỚC 2: Cài đặt Nginx (nếu chưa có)

```bash
# Update package list
sudo apt update

# Cài Nginx
sudo apt install nginx -y

# Check version
nginx -v

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## 🚀 BƯỚC 3: Cấu hình DNS cho domain

### 3.1. Trỏ DNS về server

Vào trang quản lý DNS của nhà cung cấp domain (VD: GoDaddy, Namecheap, etc.) và thêm:

```
Type    Name       Value              TTL
A       @          your-server-ip     3600
A       www        your-server-ip     3600
A       admin      your-server-ip     3600
A       dealer     your-server-ip     3600
A       api        your-server-ip     3600
A       ws         your-server-ip     3600
```

### 3.2. Kiểm tra DNS đã trỏ đúng chưa

```bash
# Kiểm tra từ server
ping 4thitek.vn
ping www.4thitek.vn
ping admin.4thitek.vn
ping dealer.4thitek.vn
ping api.4thitek.vn
ping ws.4thitek.vn

# Hoặc dùng nslookup
nslookup 4thitek.vn
nslookup admin.4thitek.vn
nslookup dealer.4thitek.vn
nslookup api.4thitek.vn
nslookup ws.4thitek.vn
```

**Chú ý:** DNS có thể mất 1-24 giờ để propagate (lan truyền) toàn cầu.

---

## 🚀 BƯỚC 4: Deploy Nginx Configurations

**⚠️ QUAN TRỌNG:** Shared config chứa `limit_req_zone` chỉ được load 1 lần duy nhất. Nếu include trong mỗi site config sẽ bị lỗi duplicate khi enable nhiều sites.

### 4.1. Deploy shared configuration vào conf.d/

Nginx tự động load tất cả files trong `/etc/nginx/conf.d/*.conf` một lần duy nhất.

```bash
# Tạo file shared-config.conf
sudo nano /etc/nginx/conf.d/shared-config.conf
# Paste content từ deployment/nginx/shared-config.conf
```

**Verify nginx.conf có include conf.d/:**

```bash
grep "conf.d" /etc/nginx/nginx.conf
# Phải thấy: include /etc/nginx/conf.d/*.conf;
```

Nếu không thấy, thêm vào nginx.conf:

```bash
sudo nano /etc/nginx/nginx.conf

# Thêm dòng này trong block http { ... }:
# include /etc/nginx/conf.d/*.conf;
# include /etc/nginx/sites-enabled/*;
```

### 4.2. Tạo site configs

**⚠️ LƯU Ý QUAN TRỌNG:** Khi paste nội dung từ các file `.conf`, **PHẢI XÓA** dòng `include shared-config.conf` nếu có.

```bash
# Tạo file main domain
sudo nano /etc/nginx/sites-available/4thitek.vn
# Paste content từ deployment/nginx/4thitek.vn.conf
# QUAN TRỌNG: XÓA dòng "include shared-config.conf;" nếu có

# Tạo file admin
sudo nano /etc/nginx/sites-available/admin.4thitek.vn
# Paste content từ deployment/nginx/admin.4thitek.vn.conf
# QUAN TRỌNG: XÓA dòng "include shared-config.conf;" nếu có

# Tạo file dealer
sudo nano /etc/nginx/sites-available/dealer.4thitek.vn
# Paste content từ deployment/nginx/dealer.4thitek.vn.conf
# QUAN TRỌNG: XÓA dòng "include shared-config.conf;" nếu có

# Tạo file API
sudo nano /etc/nginx/sites-available/api.4thitek.vn
# Paste content từ deployment/nginx/api.4thitek.vn.conf
# QUAN TRỌNG: XÓA dòng "include shared-config.conf;" nếu có

# Tạo file WebSocket
sudo nano /etc/nginx/sites-available/ws.4thitek.vn
# Paste content từ deployment/nginx/ws.4thitek.vn.conf
# QUAN TRỌNG: XÓA dòng "include shared-config.conf;" nếu có
```

### 4.3. Enable tất cả sites

```bash
# Tạo symlinks để enable sites
sudo ln -sf /etc/nginx/sites-available/4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/admin.4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/dealer.4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/api.4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/ws.4thitek.vn /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm -f /etc/nginx/sites-enabled/default
```

### 4.4. Verify configuration

```bash
# Verify shared-config chỉ có 1 nơi
grep -r "shared-config" /etc/nginx/sites-enabled/
# Không nên thấy kết quả gì (vì đã xóa dòng include)

# Verify shared-config trong conf.d/
ls -la /etc/nginx/conf.d/shared-config.conf
# Phải thấy file này

# Test nginx config
sudo nginx -t
# Phải thấy: syntax is ok, test is successful
```

### 4.5. Reload nginx

```bash
# Nếu test OK, reload nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### 4.6. Quản lý Sites

**Enable một site:**
```bash
sudo ln -s /etc/nginx/sites-available/[site-name] /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Disable một site:**
```bash
sudo rm /etc/nginx/sites-enabled/[site-name]
sudo nginx -t && sudo systemctl reload nginx
```

**Xem sites đang enable:**
```bash
ls -la /etc/nginx/sites-enabled/
# Should see symlinks for all 4 domains
```

**⚠️ Common Mistake:** Nếu bạn thấy lỗi `limit_req_zone "api_limit" is already bound`, nghĩa là shared-config được load nhiều lần. Xem phần Troubleshooting - Lỗi 9 để sửa.

---

## 🚀 BƯỚC 5: Khởi động Docker containers

### 5.1. Chuyển vào thư mục project

```bash
cd /opt/microservice-parent
```

### 5.2. Build và start containers

```bash
# Build images (lần đầu)
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 5.3. Verify các containers đang chạy

```bash
# Check container status
docker ps

# Check logs nếu có lỗi
docker-compose logs -f api-gateway
docker-compose logs -f main-frontend
docker-compose logs -f admin-frontend
docker-compose logs -f dealer-frontend
```

### 5.4. Test kết nối local từ server

```bash
# Test API Gateway
curl http://127.0.0.1:8080/actuator/health

# Test Main Frontend
curl http://127.0.0.1:3000

# Test Admin Frontend
curl http://127.0.0.1:9000

# Test Dealer Frontend
curl http://127.0.0.1:5173
```

**Quan trọng:** Tất cả backend services PHẢI chạy và respond trước khi nginx có thể proxy requests.

---

## 🚀 BƯỚC 6: Mở firewall ports

```bash
# Cho phép HTTP và HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Cho phép SSH (nếu chưa có)
sudo ufw allow 22/tcp

# Enable firewall (nếu chưa enable)
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🚀 BƯỚC 7: Test website

### 7.1. Test từ browser

Mở trình duyệt và truy cập:

```
https://4thitek.vn          (Main customer site)
https://www.4thitek.vn      (Should redirect to main)
https://admin.4thitek.vn    (Admin dashboard)
https://dealer.4thitek.vn   (Dealer portal)
https://api.4thitek.vn      (API Gateway)
https://ws.4thitek.vn/ws    (WebSocket endpoint)
```

### 7.2. Test HTTP → HTTPS redirect

```bash
# Tất cả phải redirect 301 sang HTTPS
curl -I http://4thitek.vn
curl -I http://admin.4thitek.vn
curl -I http://dealer.4thitek.vn
curl -I http://api.4thitek.vn
curl -I http://ws.4thitek.vn
```

### 7.3. Test SSL certificate

```bash
# Test SSL từ command line
openssl s_client -connect 4thitek.vn:443 -servername 4thitek.vn
openssl s_client -connect admin.4thitek.vn:443 -servername admin.4thitek.vn
openssl s_client -connect dealer.4thitek.vn:443 -servername dealer.4thitek.vn
openssl s_client -connect api.4thitek.vn:443 -servername api.4thitek.vn
openssl s_client -connect ws.4thitek.vn:443 -servername ws.4thitek.vn

# Check certificate expiry
echo | openssl s_client -servername 4thitek.vn -connect 4thitek.vn:443 2>/dev/null | openssl x509 -noout -dates

# Test SSL online
# Vào: https://www.ssllabs.com/ssltest/
# Nhập từng domain: 4thitek.vn, admin.4thitek.vn, dealer.4thitek.vn, api.4thitek.vn
# Target: Grade A hoặc A+
```

### 7.4. Check browser console

Mở Developer Tools (F12) trong browser và check từng domain:

**Cho mỗi domain, verify:**
- ✅ Console: Không có errors
- ✅ Network: API requests thành công (status 200)
- ✅ Security tab: SSL certificate hợp lệ, green padlock
- ✅ Không có mixed content warnings (HTTP resources on HTTPS page)
- ✅ Không có CORS errors

---

## 🚀 BƯỚC 8: Alternative - Using Let's Encrypt (Free SSL)

Nếu muốn dùng Let's Encrypt thay vì mua SSL:

### 8.1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2. Generate Certificates

**Option A: Generate all at once (Recommended)**
```bash
sudo certbot certonly --nginx \
  -d 4thitek.vn \
  -d www.4thitek.vn \
  -d admin.4thitek.vn \
  -d dealer.4thitek.vn \
  -d api.4thitek.vn \
  -d ws.4thitek.vn
```

**Option B: Generate separately**
```bash
# Main domain
sudo certbot certonly --nginx -d 4thitek.vn -d www.4thitek.vn

# Admin
sudo certbot certonly --nginx -d admin.4thitek.vn

# Dealer
sudo certbot certonly --nginx -d dealer.4thitek.vn

# API
sudo certbot certonly --nginx -d api.4thitek.vn

# WebSocket
sudo certbot certonly --nginx -d ws.4thitek.vn
```

### 8.3. Copy Certificates to Expected Locations

```bash
# Main domain
sudo mkdir -p /etc/ssl/4thitek.vn
sudo cp /etc/letsencrypt/live/4thitek.vn/fullchain.pem /etc/ssl/4thitek.vn/fullchain.crt
sudo cp /etc/letsencrypt/live/4thitek.vn/privkey.pem /etc/ssl/4thitek.vn/private.key

# Admin (if generated separately)
sudo mkdir -p /etc/ssl/admin.4thitek.vn
sudo cp /etc/letsencrypt/live/admin.4thitek.vn/fullchain.pem /etc/ssl/admin.4thitek.vn/fullchain.crt
sudo cp /etc/letsencrypt/live/admin.4thitek.vn/privkey.pem /etc/ssl/admin.4thitek.vn/private.key

# Dealer (if generated separately)
sudo mkdir -p /etc/ssl/dealer.4thitek.vn
sudo cp /etc/letsencrypt/live/dealer.4thitek.vn/fullchain.pem /etc/ssl/dealer.4thitek.vn/fullchain.crt
sudo cp /etc/letsencrypt/live/dealer.4thitek.vn/privkey.pem /etc/ssl/dealer.4thitek.vn/private.key

# API (if generated separately)
sudo mkdir -p /etc/ssl/api.4thitek.vn
sudo cp /etc/letsencrypt/live/api.4thitek.vn/fullchain.pem /etc/ssl/api.4thitek.vn/fullchain.crt
sudo cp /etc/letsencrypt/live/api.4thitek.vn/privkey.pem /etc/ssl/api.4thitek.vn/private.key

# WebSocket (if generated separately)
sudo mkdir -p /etc/ssl/ws.4thitek.vn
sudo cp /etc/letsencrypt/live/ws.4thitek.vn/fullchain.pem /etc/ssl/ws.4thitek.vn/fullchain.crt
sudo cp /etc/letsencrypt/live/ws.4thitek.vn/privkey.pem /etc/ssl/ws.4thitek.vn/private.key
```

### 8.4. Test Auto-Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Check auto-renewal timer
sudo systemctl status certbot.timer
```

Let's Encrypt certificates expire sau 90 ngày nhưng sẽ auto-renew nếu setup đúng.

---

## 🚀 BƯỚC 9: Monitoring và Troubleshooting

### 9.1. Check Nginx logs

```bash
# Access logs cho từng domain
sudo tail -f /var/log/nginx/4thitek.vn-access.log
sudo tail -f /var/log/nginx/admin.4thitek.vn-access.log
sudo tail -f /var/log/nginx/dealer.4thitek.vn-access.log
sudo tail -f /var/log/nginx/api.4thitek.vn-access.log
sudo tail -f /var/log/nginx/ws.4thitek.vn-access.log

# Error logs
sudo tail -f /var/log/nginx/4thitek.vn-error.log
sudo tail -f /var/log/nginx/admin.4thitek.vn-error.log
sudo tail -f /var/log/nginx/dealer.4thitek.vn-error.log
sudo tail -f /var/log/nginx/api.4thitek.vn-error.log
sudo tail -f /var/log/nginx/ws.4thitek.vn-error.log
```

### 9.2. Check Docker logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f main-frontend
docker-compose logs -f admin-frontend
docker-compose logs -f dealer-frontend
```

### 9.3. Restart services nếu cần

```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart Docker containers
docker-compose restart

# Restart specific container
docker-compose restart api-gateway
```

---

## ❌ Troubleshooting - Các lỗi thường gặp

### Lỗi 1: "502 Bad Gateway"

**Nguyên nhân:** Nginx không kết nối được tới backend container

**Giải pháp:**
```bash
# Check container có chạy không
docker ps | grep -E "(main-frontend|admin-frontend|dealer-frontend|api-gateway)"

# Check port đang listen
sudo netstat -tlnp | grep -E "(3000|9000|5173|8080)"

# Test backend directly
curl http://127.0.0.1:8080/actuator/health
curl http://127.0.0.1:3000
curl http://127.0.0.1:9000
curl http://127.0.0.1:5173

# Check nginx error logs
sudo tail -f /var/log/nginx/4thitek.vn-error.log

# Restart containers
docker-compose restart
```

### Lỗi 2: "SSL certificate problem"

**Nguyên nhân:** Certificate không hợp lệ hoặc chain không đầy đủ

**Giải pháp:**
```bash
# Verify certificate chain
sudo openssl verify -CAfile /etc/ssl/4thitek.vn/ca-bundle.crt /etc/ssl/4thitek.vn/certificate.crt

# Re-create fullchain
sudo cat /etc/ssl/4thitek.vn/certificate.crt /etc/ssl/4thitek.vn/ca-bundle.crt > /etc/ssl/4thitek.vn/fullchain.crt

# Test SSL handshake
openssl s_client -connect 4thitek.vn:443 -servername 4thitek.vn

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Lỗi 3: "ERR_CONNECTION_REFUSED"

**Nguyên nhân:** Firewall chặn port hoặc Nginx không chạy

**Giải pháp:**
```bash
# Check Nginx status
sudo systemctl status nginx

# Check if nginx is listening on ports
sudo netstat -tlnp | grep nginx

# Check firewall
sudo ufw status

# Open ports if needed
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Restart nginx
sudo systemctl restart nginx
```

### Lỗi 4: CORS errors trong browser console

**Ví dụ error:**
```
Access to XMLHttpRequest at 'https://4thitek.vn/api/...' from origin 'https://admin.4thitek.vn' has been blocked by CORS policy
```

**Nguyên nhân:** API Gateway CORS configuration chưa allow subdomains

**Giải pháp:**
- Check backend CORS settings
- Ensure API allows: `*.4thitek.vn` or specific domains
- Verify nginx proxy headers đang forward correctly

### Lỗi 5: "NET::ERR_CERT_COMMON_NAME_INVALID"

**Nguyên nhân:** SSL certificate không match với domain đang truy cập

**Giải pháp:**
```bash
# Check certificate domains
sudo openssl x509 -in /etc/ssl/4thitek.vn/certificate.crt -text -noout | grep -A1 "Subject Alternative Name"

# Certificate phải có:
# Wildcard: DNS:*.4thitek.vn, DNS:4thitek.vn
# Hoặc explicit: DNS:4thitek.vn, DNS:www.4thitek.vn, DNS:admin.4thitek.vn, DNS:dealer.4thitek.vn
```

**Nếu certificate không có đủ domains:**
- Mua lại certificate với Wildcard (`*.4thitek.vn`)
- Hoặc Multi-domain (SAN) certificate bao gồm tất cả subdomains

### Lỗi 6: "nginx: [emerg] cannot load certificate"

**Nguyên nhân:** File permissions hoặc file path không đúng

**Giải pháp:**
```bash
# Check file exists
ls -la /etc/ssl/4thitek.vn/

# Check permissions
sudo chmod 644 /etc/ssl/4thitek.vn/fullchain.crt
sudo chmod 600 /etc/ssl/4thitek.vn/private.key
sudo chown root:root /etc/ssl/4thitek.vn/*

# Test nginx config
sudo nginx -t
```

### Lỗi 7: Site chỉ hoạt động qua HTTP, không qua HTTPS

**Nguyên nhân:** Firewall chặn port 443

**Giải pháp:**
```bash
# Check if port 443 is open
sudo ufw status | grep 443

# Open port 443
sudo ufw allow 443/tcp

# Check nginx is listening on 443
sudo netstat -tlnp | grep :443
```

### Lỗi 8: One domain works, others don't

**Nguyên nhân:** Config file hoặc symlink thiếu/sai

**Giải pháp:**
```bash
# Check all enabled sites
ls -la /etc/nginx/sites-enabled/

# Should see:
# 4thitek.vn -> /etc/nginx/sites-available/4thitek.vn
# admin.4thitek.vn -> /etc/nginx/sites-available/admin.4thitek.vn
# dealer.4thitek.vn -> /etc/nginx/sites-available/dealer.4thitek.vn
# api.4thitek.vn -> /etc/nginx/sites-available/api.4thitek.vn

# Test each config file
sudo nginx -t

# Check nginx error log for specific domain
sudo tail -f /var/log/nginx/admin.4thitek.vn-error.log
```

### Lỗi 9: "nginx: [emerg] limit_req_zone is already bound" (CRITICAL)

**Error message đầy đủ:**
```
nginx: [emerg] limit_req_zone "api_limit" is already bound to key "$binary_remote_addr" in /etc/nginx/shared-config.conf:5
nginx: configuration file /etc/nginx/nginx.conf test failed
```

**Nguyên nhân:** `shared-config.conf` được include nhiều lần, gây ra duplicate definitions của `limit_req_zone`.

Điều này xảy ra khi:
1. Mỗi site config có dòng `include /etc/nginx/shared-config.conf;`
2. Bạn enable nhiều sites cùng lúc (4thitek.vn, admin, dealer)
3. → Mỗi site include shared-config → duplicate definitions

**Giải pháp - FIX ngay lập tức:**

```bash
# BƯỚC 1: Di chuyển shared-config vào conf.d/ (nginx auto-load 1 lần)
sudo mv /etc/nginx/shared-config.conf /etc/nginx/conf.d/

# BƯỚC 2: Xóa dòng include trong TẤT CẢ site configs
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/4thitek.vn
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/admin.4thitek.vn
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/dealer.4thitek.vn

# BƯỚC 3: Verify nginx.conf có include conf.d/
grep "conf.d" /etc/nginx/nginx.conf
# Phải thấy: include /etc/nginx/conf.d/*.conf;

# Nếu KHÔNG thấy, thêm vào nginx.conf:
# sudo nano /etc/nginx/nginx.conf
# Thêm dòng: include /etc/nginx/conf.d/*.conf;

# BƯỚC 4: Verify không còn include trong sites-enabled
grep -r "shared-config" /etc/nginx/sites-enabled/
# Không nên thấy kết quả gì

# BƯỚC 5: Test nginx config
sudo nginx -t
# Phải thấy: syntax is ok

# BƯỚC 6: Reload nginx
sudo systemctl reload nginx
```

**Prevention - Tránh lỗi này trong tương lai:**
- KHÔNG BAO GIỜ include shared-config.conf trong site configs
- Luôn đặt shared configs (rate limiting, upstreams) trong `/etc/nginx/conf.d/`
- Nginx tự động load files trong `conf.d/` một lần duy nhất

---

## 📊 Health Check Commands

Run these regularly to verify system health:

```bash
# System resources
htop
df -h
free -h

# Docker status
docker ps
docker stats

# Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check all ports
sudo netstat -tlnp | grep -E "(80|443|3000|8080|9000|5173)"

# Test all endpoints
curl -I https://4thitek.vn
curl -I https://admin.4thitek.vn
curl -I https://dealer.4thitek.vn
curl -I https://api.4thitek.vn
curl -I https://ws.4thitek.vn

# Test API health
curl -k https://api.4thitek.vn/actuator/health

# SSL expiry check for all domains
echo | openssl s_client -servername 4thitek.vn -connect 4thitek.vn:443 2>/dev/null | openssl x509 -noout -dates
echo | openssl s_client -servername admin.4thitek.vn -connect admin.4thitek.vn:443 2>/dev/null | openssl x509 -noout -dates
echo | openssl s_client -servername dealer.4thitek.vn -connect dealer.4thitek.vn:443 2>/dev/null | openssl x509 -noout -dates
echo | openssl s_client -servername api.4thitek.vn -connect api.4thitek.vn:443 2>/dev/null | openssl x509 -noout -dates
echo | openssl s_client -servername ws.4thitek.vn -connect ws.4thitek.vn:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔐 Security Best Practices

### 1. Backup SSL certificates

```bash
# Backup all SSL certificates
sudo tar -czf ssl-backup-$(date +%Y%m%d).tar.gz /etc/ssl/4thitek.vn/ /etc/ssl/admin.4thitek.vn/ /etc/ssl/dealer.4thitek.vn/ /etc/ssl/api.4thitek.vn/ /etc/ssl/ws.4thitek.vn/

# Move to safe location
# scp ssl-backup-*.tar.gz user@backup-server:/backups/
```

### 2. Renew certificate trước khi hết hạn

```bash
# Check expiry date
sudo openssl x509 -enddate -noout -in /etc/ssl/4thitek.vn/certificate.crt

# For Let's Encrypt - test renewal
sudo certbot renew --dry-run
```

### 3. Monitor certificate expiration

Set up monitoring alerts 30 days before expiry.

### 4. Regular security updates

```bash
sudo apt update && sudo apt upgrade -y
docker-compose pull  # Update docker images
```

### 5. Secure private keys

```bash
# Private keys should NEVER be:
# - Committed to Git
# - Shared publicly
# - Have permissions other than 600
# - Stored unencrypted on local machines

# Always verify:
sudo ls -la /etc/ssl/*/private.key
# Should show: -rw------- (600)
```

---

## 📞 Support

Nếu gặp vấn đề:

### Checklist khi troubleshoot:

1. **Check DNS**: `nslookup domain.com`
2. **Check SSL**: `openssl s_client -connect domain.com:443`
3. **Check Nginx**: `sudo nginx -t` and `sudo systemctl status nginx`
4. **Check Logs**: Nginx logs + Docker logs
5. **Check Firewall**: `sudo ufw status`
6. **Check Backends**: `docker ps` and test local ports
7. **Check Certificates**: Verify expiry and domain coverage

### Test URLs:

- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **DNS Checker**: https://dnschecker.org/
- **Security Headers**: https://securityheaders.com/

---

## 📝 Summary - Deployment Checklist

### SSL & DNS Setup
- [ ] DNS records configured and propagated
  - [ ] A record: `@` → server IP
  - [ ] A record: `www` → server IP
  - [ ] A record: `admin` → server IP
  - [ ] A record: `dealer` → server IP
  - [ ] A record: `api` → server IP
  - [ ] A record: `ws` → server IP
- [ ] SSL certificates obtained (wildcard or multi-domain)
- [ ] SSL files uploaded to `/etc/ssl/` directories
- [ ] Fullchain certificates created
- [ ] File permissions set correctly (600 for private keys)
- [ ] Certificates verified (valid and matching keys)

### Nginx Configuration
- [ ] Nginx installed and running
- [ ] Shared config deployed to `/etc/nginx/conf.d/shared-config.conf` ⚠️
- [ ] Verified nginx.conf includes `/etc/nginx/conf.d/*.conf`
- [ ] All 5 domain configs deployed to `sites-available/`
  - [ ] 4thitek.vn.conf
  - [ ] admin.4thitek.vn.conf
  - [ ] dealer.4thitek.vn.conf
  - [ ] api.4thitek.vn.conf
  - [ ] ws.4thitek.vn.conf
- [ ] Verified NO `include shared-config` in site configs ⚠️
- [ ] Symlinks created in `sites-enabled/`
- [ ] Nginx config tested (`nginx -t` returns OK)
- [ ] NO duplicate `limit_req_zone` errors ✅

### Backend Services
- [ ] Docker containers running (API + 3 frontends + notification service)
  - [ ] API Gateway (port 8080) → Accessible via api.4thitek.vn
  - [ ] Notification Service (port 8087) → WebSocket accessible via ws.4thitek.vn
  - [ ] Main Frontend (port 3000)
  - [ ] Admin Frontend (port 9000)
  - [ ] Dealer Frontend (port 5173)
- [ ] Backend services responding on local ports
- [ ] All services pass health checks

### Security & Network
- [ ] Firewall configured (ports 80, 443, 22 open)
- [ ] All domains accessible via HTTPS
  - [ ] https://4thitek.vn
  - [ ] https://www.4thitek.vn
  - [ ] https://admin.4thitek.vn
  - [ ] https://dealer.4thitek.vn
  - [ ] https://api.4thitek.vn
  - [ ] https://ws.4thitek.vn/ws (WebSocket endpoint)
- [ ] HTTP → HTTPS redirects working (301)
- [ ] SSL certificates valid (green padlock in browser)
- [ ] No errors in browser console
- [ ] No CORS errors
- [ ] SSL Labs grade A or A+

### Monitoring & Maintenance
- [ ] Monitoring setup for certificate expiry
- [ ] Backups configured
  - [ ] SSL certificates backup
  - [ ] Nginx configs backup
  - [ ] Database backup

**⚠️ CRITICAL CHECKS:**
1. ✅ `shared-config.conf` PHẢI ở `/etc/nginx/conf.d/` (KHÔNG phải `/etc/nginx/`)
2. ✅ Site configs KHÔNG được có dòng `include shared-config.conf`
3. ✅ `sudo nginx -t` KHÔNG có lỗi duplicate `limit_req_zone`

**Lưu ý quan trọng:**
- Private key TUYỆT ĐỐI không được chia sẻ hoặc commit lên Git
- Backup certificates và configs thường xuyên
- Monitor certificate expiration date (renew trước 30 ngày)
- Keep system and dependencies updated
- Nếu gặp lỗi, xem phần Troubleshooting - đặc biệt Lỗi 9 về duplicate limit_req_zone
