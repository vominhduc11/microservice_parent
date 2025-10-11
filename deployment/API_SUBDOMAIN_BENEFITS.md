# API Subdomain Benefits - api.4thitek.vn

## Tổng Quan

Tài liệu này giải thích lý do tại sao nên sử dụng subdomain riêng `api.4thitek.vn` cho API Gateway thay vì expose API qua các subdomain khác.

## Kiến Trúc Hiện Tại

### 4 Domains Chính:
1. **4thitek.vn** - Main customer website (Port 3000)
2. **admin.4thitek.vn** - Admin dashboard (Port 9000)
3. **dealer.4thitek.vn** - Dealer portal (Port 5173)
4. **api.4thitek.vn** - API Gateway (Port 8080) ⭐ **NEW**

## Lợi Ích Của API Subdomain

### 1. 🎯 Professional API Endpoint

**Trước:**
```
https://4thitek.vn/api/products
https://admin.4thitek.vn/api/orders
https://dealer.4thitek.vn/api/warranty
```

**Sau:**
```
https://api.4thitek.vn/products
https://api.4thitek.vn/orders
https://api.4thitek.vn/warranty
```

**Lợi ích:**
- URL ngắn gọn, dễ nhớ, chuyên nghiệp
- Dễ dàng document trong API docs/Swagger
- Thuận tiện cho third-party integrations
- Phù hợp với REST API best practices

### 2. 🔒 Simplified CORS Management

**Vấn đề khi không có api subdomain:**
- Mỗi frontend cần config CORS riêng
- Khó quản lý khi có nhiều origins
- Phức tạp khi add thêm mobile app/partner integration

**Với api.4thitek.vn:**
```nginx
# File: deployment/nginx/api.4thitek.vn.conf (lines 70-73)
add_header Access-Control-Allow-Origin "https://4thitek.vn https://admin.4thitek.vn https://dealer.4thitek.vn" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
```

**Lợi ích:**
- Tập trung quản lý CORS ở 1 nơi
- Dễ dàng thêm/xóa allowed origins
- Consistent CORS policy cho tất cả clients

### 3. 📱 Mobile App & Third-Party Support

**Use cases:**
- **Mobile apps** (iOS/Android) gọi API trực tiếp
- **Partner integrations** cần access API
- **Webhooks** từ payment gateways, shipping providers
- **Future microservices** từ external systems

**Ví dụ Mobile App:**
```javascript
// React Native / Flutter
const API_BASE_URL = 'https://api.4thitek.vn';

// Login
fetch(`${API_BASE_URL}/auth/login`, { ... });

// Get products
fetch(`${API_BASE_URL}/products`, { ... });

// Create order
fetch(`${API_BASE_URL}/orders`, { ... });
```

**Lợi ích:**
- Mobile apps không bị confuse bởi multiple domains
- Consistent base URL cho tất cả API calls
- Dễ dàng versioning: `api.4thitek.vn/v2/...`

### 4. 📊 Better Monitoring & Analytics

**Nginx Rate Limiting:**
```nginx
# File: deployment/nginx/shared-config.conf (line 14)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# File: deployment/nginx/api.4thitek.vn.conf (line 99)
location / {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://api_backend/;
}
```

**Lợi ích:**
- Separate logs: `/var/log/nginx/api.4thitek.vn-access.log`
- Riêng rate limiting cho API traffic
- Dễ dàng monitor API performance
- Phân tích API usage patterns
- Detect API abuse/attacks

### 5. 🚀 Scalability & Load Balancing

**Hiện tại:**
```nginx
# File: deployment/nginx/shared-config.conf (lines 18-21)
upstream api_backend {
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

**Tương lai (Multi-instance):**
```nginx
upstream api_backend {
    server 127.0.0.1:8080 weight=3;
    server 127.0.0.1:8081 weight=2;
    server 127.0.0.1:8082 weight=1;
    least_conn;
    keepalive 64;
}
```

**Lợi ích:**
- Dễ dàng scale API Gateway horizontally
- Load balancing cho multiple API instances
- Zero-downtime deployments
- API riêng không ảnh hưởng frontend performance

### 6. 📚 API Documentation & Swagger UI

**Swagger UI endpoint:**
```nginx
# File: deployment/nginx/api.4thitek.vn.conf (lines 133-149)
# location /docs {
#     proxy_pass http://api_backend/swagger-ui/index.html;
# }
```

**Lợi ích:**
- Professional API docs URL: `https://api.4thitek.vn/docs`
- Dễ dàng share với developers/partners
- Có thể bật/tắt docs độc lập (production vs staging)
- Swagger URL không conflict với frontend routes

### 7. 🔐 Security & SSL Management

**SSL Certificate Management:**
```nginx
# File: deployment/nginx/api.4thitek.vn.conf (lines 44-45)
ssl_certificate /etc/ssl/api.4thitek.vn/fullchain.crt;
ssl_certificate_key /etc/ssl/api.4thitek.vn/private.key;
```

**Security Headers cho API:**
```nginx
# File: deployment/nginx/api.4thitek.vn.conf (lines 64-67)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

**Lợi ích:**
- Separate SSL certificate cho API (có thể renew độc lập)
- Security headers phù hợp với API (DENY X-Frame-Options)
- Có thể apply stricter security policies cho API
- Health check endpoint: `https://api.4thitek.vn/actuator/health`

### 8. 🌐 SEO & Domain Reputation

**Lợi ích:**
- **4thitek.vn** giữ nguyên cho customer content (tốt cho SEO)
- **api.4thitek.vn** dành riêng cho programmatic access
- Tránh API traffic làm "ô nhiễm" analytics của main domain
- Professional image khi partners check DNS records

## So Sánh Chi Tiết

| Tiêu chí | Không có API Subdomain | Có api.4thitek.vn ✅ |
|----------|----------------------|---------------------|
| **URL Structure** | `4thitek.vn/api/products` | `api.4thitek.vn/products` |
| **CORS Config** | Phải config ở mỗi frontend | Tập trung ở 1 nơi |
| **Mobile Support** | Confusing, nhiều domains | Clean, 1 base URL |
| **Monitoring** | Mixed với frontend logs | Separate API logs |
| **Rate Limiting** | Shared với frontend | Dedicated cho API |
| **Swagger Docs** | Conflict với frontend routes | Clean `/docs` endpoint |
| **Scalability** | Phức tạp khi scale | Dễ dàng load balance |
| **SSL Management** | Share cert với frontend | Independent SSL cert |

## Khi Nào KHÔNG Cần API Subdomain?

Bạn **KHÔNG** cần api subdomain nếu:
- ❌ Chỉ có 1 frontend app và API chỉ phục vụ app đó
- ❌ Không có kế hoạch mobile app hoặc third-party integration
- ❌ API chỉ là internal, không public
- ❌ Startup nhỏ, chưa cần scale

## Kết Luận

### ✅ Nên Dùng api.4thitek.vn Nếu:
1. Có nhiều frontends (main, admin, dealer) ✅
2. Có kế hoạch mobile app trong tương lai ✅
3. Muốn API professional và dễ maintain ✅
4. Cần monitor và scale API riêng biệt ✅
5. Có kế hoạch third-party integrations ✅

### 🎯 Khuyến Nghị Cho 4thitek.vn:

Hệ thống hiện tại có:
- ✅ 3 frontends khác nhau
- ✅ Spring Boot microservices architecture
- ✅ Docker-based deployment
- ✅ Production-ready với SSL/HTTPS

➡️ **Kết luận: api.4thitek.vn là ABSOLUTELY NECESSARY**

## Implementation Status

### ✅ Đã Hoàn Thành:
- [x] Tạo file `deployment/nginx/api.4thitek.vn.conf`
- [x] Cấu hình SSL/TLS 1.2 & 1.3
- [x] Thiết lập CORS headers
- [x] Configure rate limiting (10 req/s với burst 20)
- [x] Proxy pass tới API Gateway (port 8080)
- [x] Health check endpoint `/actuator/health`
- [x] Security headers (HSTS, X-Frame-Options, etc.)
- [x] Update `SSL_DEPLOYMENT_GUIDE.md`
- [x] Update `DEPLOYMENT_CHECKLIST.md`
- [x] Update `shared-config.conf` với upstream api_backend

### 📋 Next Steps (Deployment):
1. Add DNS A record: `api.4thitek.vn` → Server IP
2. Deploy SSL certificate cho api.4thitek.vn
3. Copy nginx config tới server
4. Enable site và reload nginx
5. Test API endpoints
6. Update frontend configs để dùng `api.4thitek.vn`

Chi tiết xem: `deployment/SSL_DEPLOYMENT_GUIDE.md` và `deployment/DEPLOYMENT_CHECKLIST.md`

## Tài Liệu Liên Quan

- **Nginx Configs**: `deployment/nginx/api.4thitek.vn.conf`
- **Shared Config**: `deployment/nginx/shared-config.conf`
- **Deployment Guide**: `deployment/SSL_DEPLOYMENT_GUIDE.md`
- **Checklist**: `deployment/DEPLOYMENT_CHECKLIST.md`
- **Main Config**: `deployment/nginx/4thitek.vn.conf`
- **Admin Config**: `deployment/nginx/admin.4thitek.vn.conf`
- **Dealer Config**: `deployment/nginx/dealer.4thitek.vn.conf`

---

**Tác giả:** Claude Code
**Ngày tạo:** 2025-10-11
**Version:** 1.0
