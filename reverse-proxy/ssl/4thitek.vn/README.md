# SSL Certificates for 4thitek.vn

## Required Files

1. **fullchain.pem** - Full certificate chain (certificate + CA bundle)
2. **privkey.pem** - Private key (KEEP SECRET!)

## Setup Instructions

### Option 1: Copy from cloud server

If you already have SSL certificates on cloud server:

```bash
# On your local machine, copy files from cloud server
scp user@server:/etc/ssl/certs/4thitek.vn-fullchain.pem ./reverse-proxy/ssl/4thitek.vn/fullchain.pem
scp user@server:/etc/ssl/private/4thitek.vn.key ./reverse-proxy/ssl/4thitek.vn/privkey.pem
```

### Option 2: Create fullchain.pem from separate files

If you have:
- `4thitek.vn.crt` (certificate)
- `4thitek.vn-ca-bundle.crt` (CA bundle)
- `4thitek.vn.key` (private key)

```bash
# Combine certificate + CA bundle
cat 4thitek.vn.crt 4thitek.vn-ca-bundle.crt > fullchain.pem

# Copy private key
cp 4thitek.vn.key privkey.pem

# Set permissions
chmod 644 fullchain.pem
chmod 600 privkey.pem
```

### Option 3: Self-signed certificate (Development only)

For local testing:

```bash
cd reverse-proxy/ssl/4thitek.vn

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=4ThiTek/CN=4thitek.vn" \
  -addext "subjectAltName=DNS:4thitek.vn,DNS:*.4thitek.vn"

chmod 644 fullchain.pem
chmod 600 privkey.pem
```

⚠️ **WARNING:** Self-signed certificates will show security warnings in browsers!

## Verification

```bash
# Check private key
openssl rsa -in privkey.pem -check

# Check certificate
openssl x509 -in fullchain.pem -noout -text

# Verify certificate matches private key
openssl x509 -noout -modulus -in fullchain.pem | openssl md5
openssl rsa -noout -modulus -in privkey.pem | openssl md5
# Both MD5 hashes should match
```

## Security

- ✅ `fullchain.pem` can be 644 (readable)
- ✅ `privkey.pem` MUST be 600 (private, owner only)
- ❌ NEVER commit private key to git (already in .gitignore)
- ❌ NEVER share private key
