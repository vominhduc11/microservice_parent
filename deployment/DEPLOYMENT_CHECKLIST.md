# 🚀 Deployment Checklist for 4thitek.vn - Multi-Domain Architecture

**System Overview:**
- 4 domains: Main, Admin, Dealer, API
- Modular nginx configs (separate file for each domain)
- SSL/HTTPS for all domains
- Docker-based microservices

---

## ✅ Pre-Deployment Checklist

### 1. Domain & DNS Setup
- [ ] Domain 4thitek.vn đã mua và active
- [ ] DNS records đã được cấu hình:
  - [ ] `A Record`: `@` → Server IP
  - [ ] `A Record`: `www` → Server IP
  - [ ] `A Record`: `admin` → Server IP
  - [ ] `A Record`: `dealer` → Server IP
  - [ ] `A Record`: `api` → Server IP ⭐ NEW
- [ ] Verify DNS đã propagate: `nslookup 4thitek.vn`, `nslookup api.4thitek.vn`

### 2. SSL Certificate Setup
- [ ] Đã nhận 3 files từ nhà cung cấp SSL:
  - [ ] Private Key (`.key`)
  - [ ] Certificate (`.crt`)
  - [ ] CA Bundle (`.ca-bundle` hoặc `.crt`)
- [ ] Certificate bao gồm đủ domains/subdomains:
  - [ ] 4thitek.vn
  - [ ] www.4thitek.vn
  - [ ] admin.4thitek.vn
  - [ ] dealer.4thitek.vn
  - [ ] api.4thitek.vn ⭐ NEW
  - (Hoặc wildcard: `*.4thitek.vn` - Recommended)
- [ ] Certificate chưa hết hạn (check expiry date)

### 3. Server Requirements
- [ ] Server cloud đã chuẩn bị (VPS/Cloud)
- [ ] Operating System: Ubuntu 20.04+ hoặc Debian 10+
- [ ] RAM: Tối thiểu 4GB (recommended 8GB+)
- [ ] Storage: Tối thiểu 20GB free space
- [ ] CPU: Tối thiểu 2 cores
- [ ] SSH access đã được cấu hình
- [ ] Root hoặc sudo privileges

### 4. Required Software on Server
- [ ] Docker đã được cài đặt
- [ ] Docker Compose đã được cài đặt
- [ ] Nginx đã được cài đặt
- [ ] Git đã được cài đặt (để clone project)
- [ ] Firewall (ufw) đã được cấu hình

---

## 📦 Deployment Steps

### Phase 1: Server Setup (30 mins)

#### Step 1.1: Connect to Server
```bash
ssh root@your-server-ip
```
- [ ] Kết nối thành công vào server

#### Step 1.2: Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```
- [ ] Docker installed: `docker --version`
- [ ] Docker Compose installed: `docker-compose --version`
- [ ] Nginx installed: `nginx -v`
- [ ] Git installed: `git --version`

#### Step 1.3: Configure Firewall
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```
- [ ] Firewall configured và enabled
- [ ] Ports 80, 443, 22 đã open

---

### Phase 2: SSL Certificate Installation (15 mins)

#### Step 2.1: Create SSL Directory
```bash
sudo mkdir -p /etc/ssl/4thitek.vn
sudo chmod 700 /etc/ssl/4thitek.vn
```
- [ ] Directory `/etc/ssl/4thitek.vn` đã được tạo

#### Step 2.2: Upload SSL Files
Upload 3 files vào server (dùng SCP hoặc copy-paste):
- [ ] `private.key` uploaded to `/etc/ssl/4thitek.vn/`
- [ ] `certificate.crt` uploaded to `/etc/ssl/4thitek.vn/`
- [ ] `ca-bundle.crt` uploaded to `/etc/ssl/4thitek.vn/`

#### Step 2.3: Create Fullchain Certificate
```bash
sudo cat /etc/ssl/4thitek.vn/certificate.crt /etc/ssl/4thitek.vn/ca-bundle.crt > /etc/ssl/4thitek.vn/fullchain.crt
```
- [ ] `fullchain.crt` đã được tạo

#### Step 2.4: Set File Permissions
```bash
sudo chmod 600 /etc/ssl/4thitek.vn/private.key
sudo chmod 644 /etc/ssl/4thitek.vn/certificate.crt
sudo chmod 644 /etc/ssl/4thitek.vn/ca-bundle.crt
sudo chmod 644 /etc/ssl/4thitek.vn/fullchain.crt
sudo chown root:root /etc/ssl/4thitek.vn/*
```
- [ ] File permissions đã được set đúng

#### Step 2.5: Verify SSL Files
```bash
# Verify private key
sudo openssl rsa -in /etc/ssl/4thitek.vn/private.key -check

# Verify certificate
sudo openssl x509 -in /etc/ssl/4thitek.vn/certificate.crt -text -noout

# Verify key matches certificate
sudo openssl x509 -noout -modulus -in /etc/ssl/4thitek.vn/certificate.crt | openssl md5
sudo openssl rsa -noout -modulus -in /etc/ssl/4thitek.vn/private.key | openssl md5
# These two outputs MUST match
```
- [ ] Private key is valid
- [ ] Certificate is valid
- [ ] Key matches certificate (MD5 hashes match)

---

### Phase 3: Application Deployment (30 mins)

#### Step 3.1: Clone Project
```bash
cd /opt
sudo git clone <your-git-repo-url> microservice-parent
cd microservice-parent
```
- [ ] Project cloned successfully
- [ ] Working directory: `/opt/microservice-parent`

#### Step 3.2: Configure Environment Variables (if needed)
```bash
# Edit docker-compose.yml if needed
sudo nano docker-compose.yml

# Check environment variables
```
- [ ] Environment variables reviewed
- [ ] Database credentials set
- [ ] API keys configured (if any)

#### Step 3.3: Build Docker Images
```bash
cd /opt/microservice-parent
docker-compose build
```
- [ ] All images built successfully
- [ ] No build errors

#### Step 3.4: Start Services
```bash
docker-compose up -d
```
- [ ] All containers started
- [ ] Check status: `docker-compose ps`

#### Step 3.5: Verify Containers
```bash
# Check all containers are running
docker ps

# Check specific containers
docker ps | grep -E "(main-frontend|admin-frontend|dealer-frontend|api-gateway)"

# Check logs
docker-compose logs -f api-gateway
docker-compose logs -f main-frontend
```
- [ ] API Gateway running on port 8080
- [ ] Main Frontend running on port 3000
- [ ] Admin Frontend running on port 9000
- [ ] Dealer Frontend running on port 5173
- [ ] No critical errors in logs

#### Step 3.6: Test Local Connections
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
- [ ] API Gateway responds (200 OK)
- [ ] Main Frontend responds
- [ ] Admin Frontend responds
- [ ] Dealer Frontend responds

---

### Phase 4: Nginx Configuration - Modular Setup (20 mins)

**⚠️ IMPORTANT:** Sử dụng modular nginx configs để tránh duplicate `limit_req_zone` errors!

#### Step 4.1: Deploy Shared Configuration
```bash
# Copy shared config to conf.d/ (auto-loaded by nginx)
sudo cp /opt/microservice-parent/deployment/nginx/shared-config.conf /etc/nginx/conf.d/

# Verify nginx.conf includes conf.d/
grep "conf.d" /etc/nginx/nginx.conf
# Should see: include /etc/nginx/conf.d/*.conf;
```
- [ ] shared-config.conf deployed to `/etc/nginx/conf.d/`
- [ ] Nginx.conf includes `conf.d/*.conf`

#### Step 4.2: Deploy All Site Configs
```bash
# Copy all 4 domain configs
sudo cp /opt/microservice-parent/deployment/nginx/4thitek.vn.conf /etc/nginx/sites-available/4thitek.vn
sudo cp /opt/microservice-parent/deployment/nginx/admin.4thitek.vn.conf /etc/nginx/sites-available/admin.4thitek.vn
sudo cp /opt/microservice-parent/deployment/nginx/dealer.4thitek.vn.conf /etc/nginx/sites-available/dealer.4thitek.vn
sudo cp /opt/microservice-parent/deployment/nginx/api.4thitek.vn.conf /etc/nginx/sites-available/api.4thitek.vn

# CRITICAL: Remove include directives (to avoid duplicates)
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/4thitek.vn
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/admin.4thitek.vn
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/dealer.4thitek.vn
sudo sed -i '/include.*shared-config.conf;/d' /etc/nginx/sites-available/api.4thitek.vn
```
- [ ] All 4 site configs copied to `sites-available/`
- [ ] NO `include shared-config` directives in site configs

#### Step 4.3: Enable All Sites
```bash
# Create symlinks
sudo ln -sf /etc/nginx/sites-available/4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/admin.4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/dealer.4thitek.vn /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/api.4thitek.vn /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default
```
- [ ] All 4 sites enabled (check: `ls -la /etc/nginx/sites-enabled/`)

#### Step 4.4: Verify and Test Configuration
```bash
# Verify no duplicate includes
grep -r "shared-config" /etc/nginx/sites-enabled/
# Should return NOTHING

# Test nginx config
sudo nginx -t
# MUST see: syntax is ok, test is successful
```
- [ ] No shared-config includes found in sites-enabled
- [ ] Nginx config test passed
- [ ] NO duplicate `limit_req_zone` errors

#### Step 4.5: Reload Nginx
```bash
sudo systemctl reload nginx
sudo systemctl status nginx
```
- [ ] Nginx reloaded successfully
- [ ] Nginx is active and running

---

### Phase 5: Verification & Testing (20 mins)

#### Step 5.1: Test HTTP → HTTPS Redirect
```bash
curl -I http://4thitek.vn
curl -I http://admin.4thitek.vn
curl -I http://dealer.4thitek.vn
curl -I http://api.4thitek.vn
```
- [ ] All return `301 Moved Permanently`
- [ ] Location header points to HTTPS

#### Step 5.2: Test HTTPS Access
Open browser and test:
- [ ] https://4thitek.vn (Main site loads)
- [ ] https://www.4thitek.vn (Redirects to main)
- [ ] https://admin.4thitek.vn (Admin dashboard loads)
- [ ] https://dealer.4thitek.vn (Dealer portal loads)
- [ ] https://api.4thitek.vn (API Gateway - should see JSON or docs) ⭐

#### Step 5.3: Test SSL Certificate
```bash
# Command line test
openssl s_client -connect 4thitek.vn:443 -servername 4thitek.vn

# Check certificate details
openssl s_client -connect 4thitek.vn:443 -servername 4thitek.vn 2>/dev/null | openssl x509 -noout -dates
```
- [ ] SSL handshake successful
- [ ] Certificate is valid
- [ ] Certificate not expired

**Online SSL Test:**
- [ ] Go to https://www.ssllabs.com/ssltest/
- [ ] Enter: 4thitek.vn
- [ ] Grade: A or A+ (target)

#### Step 5.4: Test API Endpoints
```bash
# Test from server
curl -k https://4thitek.vn/api/actuator/health

# Test from browser
# Open DevTools (F12) → Network tab
```
- [ ] API requests return 200 OK
- [ ] No CORS errors in browser console
- [ ] Authentication works (if applicable)

#### Step 5.5: Browser Console Check
Open DevTools (F12) in browser for each site:

**Main Site (4thitek.vn):**
- [ ] No JavaScript errors in Console
- [ ] No failed network requests
- [ ] SSL certificate valid (Security tab)
- [ ] No mixed content warnings

**Admin Dashboard (admin.4thitek.vn):**
- [ ] No errors in Console
- [ ] API calls successful
- [ ] SSL valid

**Dealer Portal (dealer.4thitek.vn):**
- [ ] No errors in Console
- [ ] API calls successful
- [ ] SSL valid

**API Gateway (api.4thitek.vn):** ⭐ NEW
- [ ] Health endpoint: `curl https://api.4thitek.vn/actuator/health` returns 200
- [ ] No CORS errors when frontends call API
- [ ] SSL valid
- [ ] (Optional) Swagger docs accessible at `/docs` if enabled

#### Step 5.6: Performance Test
- [ ] Page load time < 3 seconds
- [ ] Images loading properly
- [ ] Static assets cached (check Network tab)

---

## 🔍 Post-Deployment Checks

### Monitoring Setup (Optional but Recommended)
- [ ] Setup uptime monitoring (e.g., UptimeRobot)
- [ ] Setup SSL expiry monitoring
- [ ] Setup log rotation for Nginx logs
- [ ] Setup automated backups

### Security Checks
- [ ] Change default passwords (database, admin accounts)
- [ ] Verify firewall rules: `sudo ufw status`
- [ ] Verify only necessary ports are open
- [ ] Setup fail2ban for SSH protection (optional)
- [ ] Enable automatic security updates

### Backup Plan
- [ ] Backup SSL certificates
```bash
sudo tar -czf ssl-backup-$(date +%Y%m%d).tar.gz /etc/ssl/4thitek.vn/
```
- [ ] Backup Nginx configs
```bash
sudo tar -czf nginx-backup-$(date +%Y%m%d).tar.gz /etc/nginx/sites-available/
```
- [ ] Backup Docker volumes
```bash
docker-compose exec postgres pg_dump -U postgres microservices_db > backup-$(date +%Y%m%d).sql
```
- [ ] Store backups in safe location (off-server)

---

## 🚨 Troubleshooting Guide

### Issue: "502 Bad Gateway"
**Check:**
```bash
docker ps                           # Are containers running?
sudo netstat -tlnp | grep 8080      # Is API Gateway listening?
docker-compose logs api-gateway     # Any errors?
sudo systemctl status nginx         # Is Nginx running?
```

### Issue: "SSL Certificate Error"
**Check:**
```bash
sudo openssl x509 -in /etc/ssl/4thitek.vn/certificate.crt -text -noout | grep "DNS:"
# Verify all domains are included

sudo nginx -t                       # Test Nginx config
sudo systemctl restart nginx        # Restart Nginx
```

### Issue: "Connection Refused"
**Check:**
```bash
sudo ufw status                     # Firewall allowing 80, 443?
sudo netstat -tlnp | grep nginx     # Nginx listening on 80, 443?
ping 4thitek.vn                     # DNS resolving correctly?
```

### Issue: "CORS Errors"
**Check:**
- API Gateway CORS configuration
- Browser DevTools Console for error details
- Nginx proxy headers in config

### Issue: Containers Keep Restarting
**Check:**
```bash
docker-compose logs <service-name>  # Check logs
docker inspect <container-id>       # Check container details
docker stats                        # Check resource usage
df -h                               # Check disk space
```

---

## 📊 Health Check Commands

Run these regularly to verify system health:

```bash
# System resources
htop
df -h

# Docker status
docker ps
docker stats

# Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check all service ports
sudo netstat -tlnp | grep -E "(80|443|3000|8080|9000|5173)"

# API health
curl -k https://4thitek.vn/api/actuator/health

# SSL expiry check
echo | openssl s_client -servername 4thitek.vn -connect 4thitek.vn:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 📝 Final Sign-off

### Production Go-Live Checklist
- [ ] All tests passed
- [ ] SSL certificate valid and A/A+ grade
- [ ] All 4 domains accessible (main, admin, dealer, api) ⭐
- [ ] API endpoints working via api.4thitek.vn
- [ ] Frontends calling API through api.4thitek.vn (not /api/)
- [ ] No duplicate limit_req_zone errors
- [ ] No errors in logs (nginx + docker)
- [ ] Monitoring setup complete
- [ ] Backups configured
- [ ] Team notified of go-live
- [ ] Documentation updated
- [ ] Rollback plan documented

**Deployment Date:** _______________

**Deployed By:** _______________

**Sign-off:** _______________

---

## 🔄 Maintenance Tasks

### Daily
- [ ] Check application logs for errors
- [ ] Verify all containers running: `docker ps`
- [ ] Check disk space: `df -h`

### Weekly
- [ ] Review Nginx access/error logs
- [ ] Check SSL certificate expiry (if < 30 days, renew)
- [ ] System updates: `sudo apt update && sudo apt upgrade`
- [ ] Backup database

### Monthly
- [ ] Full system backup
- [ ] Performance review
- [ ] Security audit
- [ ] Review and rotate logs

---

## 📞 Emergency Contacts

**Technical Support:**
- Developer: _______________
- DevOps: _______________
- SSL Provider: _______________
- Hosting Provider: _______________

**Quick Rollback:**
```bash
# Stop all services
cd /opt/microservice-parent
docker-compose down

# Restore from backup
# ... restore commands ...

# Restart
docker-compose up -d
```

---

**Note:** Check off each item as you complete it. Do not skip any steps to ensure successful deployment.
