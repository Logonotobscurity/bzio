# Docker Production Deployment Guide

**Date:** February 4, 2026  
**Status:** Production Ready ✅  
**Stack:** Next.js 16.1.1 + Prisma 5.20.0 + Auth.js v5 + PostgreSQL

---

## 1. LOCAL BUILD & TEST

### 1.1 Build Docker Image

```bash
# Navigate to project root
cd c:\Users\Baldeagle\bzionu

# Build production image
docker build -t bzionu:prod .

# Verify build succeeded
docker images | grep bzionu
# Output should show: bzionu    prod    <image-id>    <size>
```

### 1.2 Test Locally

```bash
# Create .env.docker file with test values
cat > .env.docker << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/bzionu_test
NEXTAUTH_SECRET=test-secret-change-in-production-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=your-resend-key
EMAIL_FROM=noreply@bzionu.com
EOF

# Run container locally
docker run -p 3000:3000 \
  --env-file .env.docker \
  --name bzionu-test \
  bzionu:prod

# Test in another terminal
curl http://localhost:3000
# Should return HTML (Next.js page)

# Stop container
docker stop bzionu-test
docker rm bzionu-test
```

---

## 2. PUSH TO DOCKER REGISTRY

### 2.1 Docker Hub (FREE - Recommended for beginners)

```bash
# Create account at https://hub.docker.com

# Login locally
docker login

# Tag image with username
docker tag bzionu:prod yourusername/bzionu:latest
docker tag bzionu:prod yourusername/bzionu:1.0.0

# Push to Docker Hub
docker push yourusername/bzionu:latest
docker push yourusername/bzionu:1.0.0

# Verify on hub.docker.com (your-username/bzionu)
```

### 2.2 Alternative: Container Registry (AWS ECR, Google Artifact Registry, Azure)

#### AWS ECR
```bash
# Create ECR repo in AWS Console, then:
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag bzionu:prod <account-id>.dkr.ecr.us-east-1.amazonaws.com/bzionu:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/bzionu:latest
```

#### Google Artifact Registry
```bash
# Setup gcloud auth
gcloud auth configure-docker us-central1-docker.pkg.dev

docker tag bzionu:prod us-central1-docker.pkg.dev/<project>/bzionu/app:latest
docker push us-central1-docker.pkg.dev/<project>/bzionu/app:latest
```

---

## 3. DEPLOY TO CLOUD PLATFORM

### 3.1 Railway (EASIEST - 5 minutes)

**Why Railway:** One-click Docker deployment, PostgreSQL included, free tier available

```bash
# 1. Sign up at railway.app

# 2. Create new project → Docker

# 3. Paste this docker-compose.yml:
version: '3.8'
services:
  app:
    image: yourusername/bzionu:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/bzionu
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      EMAIL_SERVER_HOST: ${EMAIL_SERVER_HOST}
      EMAIL_SERVER_PORT: ${EMAIL_SERVER_PORT}
      EMAIL_SERVER_USER: ${EMAIL_SERVER_USER}
      EMAIL_SERVER_PASSWORD: ${EMAIL_SERVER_PASSWORD}
      EMAIL_FROM: ${EMAIL_FROM}
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: bzionu
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

# 4. Set environment variables in Railway dashboard
# 5. Deploy!
```

**Environment Variables to Set:**
```
POSTGRES_USER=bzion_admin
POSTGRES_PASSWORD=<random-strong-password>
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://your-railway-url.up.railway.app
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=<resend-api-key>
EMAIL_FROM=noreply@bzionu.com
```

---

### 3.2 DigitalOcean App Platform

**Why:** $5/month, simple UI, scalable

```bash
# 1. Sign up at digitalocean.com

# 2. Apps → Create App → GitHub

# 3. Connect GitHub repo (bzionu)

# 4. Create app.yaml:
name: bzionu
services:
- name: web
  image:
    registry: docker
    registry_type: DOCKER_HUB
    repository: yourusername/bzionu
    tag: latest
  http_port: 3000
  health_check:
    http_path: /
  envs:
  - key: DATABASE_URL
    value: ${db.connection_string}
  - key: NEXTAUTH_SECRET
    value: ${NEXTAUTH_SECRET}
  - key: NEXTAUTH_URL
    value: ${APP_DOMAIN}

databases:
- name: db
  engine: PG
  version: "16"

# 5. Deploy!
```

---

### 3.3 AWS ECS (Most Powerful)

```bash
# 1. Create ECR repo (see section 2.2)
# 2. Push image to ECR
# 3. Create ECS cluster (Fargate)
# 4. Create task definition:

{
  "family": "bzionu",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/bzionu:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://user:pass@rds-endpoint:5432/bzionu"
        },
        {
          "name": "NEXTAUTH_URL",
          "value": "https://yourdomain.com"
        }
      ]
    }
  ]
}

# 5. Create service in ECS cluster
# 6. Attach ALB (load balancer)
# 7. Configure Route53 DNS
```

---

## 4. DATABASE SETUP

### 4.1 PostgreSQL on Cloud

**Option A: Managed Database (RECOMMENDED)**
```bash
# Railway: Auto-provisioned ✅
# DigitalOcean: Managed Database → PostgreSQL 16
# AWS: RDS → PostgreSQL 16
# Google Cloud: Cloud SQL → PostgreSQL 16
```

**Option B: Self-Hosted PostgreSQL**
```bash
# In docker-compose (see 3.1)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: your-secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 4.2 Run Migrations

```bash
# Get DATABASE_URL from your cloud provider
export DATABASE_URL="postgresql://user:pass@host:5432/bzionu"

# Option A: Via Docker
docker run \
  -e DATABASE_URL="$DATABASE_URL" \
  yourusername/bzionu:latest \
  npx prisma migrate deploy

# Option B: Local (if npm installed)
npx prisma migrate deploy
```

### 4.3 Verify Database Connection

```bash
# SSH into container (if accessible)
docker exec -it <container-id> sh

# Test connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 5. DOMAIN & SSL

### 5.1 Point Domain to Deployment

**Railway/DigitalOcean:**
```
Your Domain (namecheap, godaddy, etc.)
  → Update DNS to CNAME → your-app.railway.app or your-app.ondigitalocean.app
```

**AWS:**
```
Create Route53 hosted zone → Point domain name servers → Create A record → ALB DNS
```

### 5.2 SSL Certificate (Auto)

- **Railway:** Auto HTTPS ✅
- **DigitalOcean:** Auto HTTPS with Let's Encrypt ✅
- **AWS:** Use ACM (AWS Certificate Manager) with CloudFront or ALB

---

## 6. ENVIRONMENT VARIABLES (PRODUCTION)

**NEVER commit .env files to Git!**

### 6.1 Generate NEXTAUTH_SECRET

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows PowerShell
$bytes = [System.Random]::new().Next(0, 256) 
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'*6|% {$_[$([Random]::new().Next(0, $_.Length))]}) -join ''))

# Or use online tool: https://generate-secret.vercel.app
```

### 6.2 Set in Cloud Dashboard

**Railway:**
```
Project → Environment → Add Variables
```

**DigitalOcean:**
```
Apps → app → Settings → Environment Variables
```

**AWS ECS:**
```
Secrets Manager → Create Secret → Reference in task definition
```

### 6.3 Complete Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/bzionu

# Authentication
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production

# Email (Resend)
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=re_xxx...
EMAIL_FROM=noreply@bzionu.com

# Optional: Monitoring
SENTRY_AUTH_TOKEN=<if using Sentry>
```

---

## 7. MONITORING & LOGGING

### 7.1 View Logs

**Railway:**
```
Project → Service → Logs tab
```

**DigitalOcean:**
```
Apps → app → Logs
```

**AWS:**
```
CloudWatch → Logs → /ecs/bzionu
```

**Local Docker:**
```bash
docker logs -f <container-id>
```

### 7.2 Setup Alerts

**Sentry (Error Tracking):**
```
1. Create account at sentry.io
2. Create Next.js project
3. Set SENTRY_AUTH_TOKEN
4. Already integrated in your code ✅
```

**Health Check:**
```bash
# Test endpoint
curl https://yourdomain.com/api/health
# Should return: {"status": "ok"}
```

---

## 8. ROLLING UPDATES & SCALING

### 8.1 Update Application

```bash
# 1. Make code changes
git commit -m "fix: update feature"
git push origin main

# 2. Rebuild image
docker build -t yourusername/bzionu:latest .
docker push yourusername/bzionu:latest

# 3. Redeploy (varies by platform)
# Railway: Auto-redeploy on push
# DigitalOcean: Restart service
# AWS: Update task definition → Create new service revision
```

### 8.2 Scale Up

**Railway:**
```
Instance Type: Change from Starter to Standard or Pro
```

**DigitalOcean:**
```
Apps → Service → Edit → Increase instance count or CPU/RAM
```

**AWS:**
```
ECS Service → Update → Desired count: increase
```

---

## 9. SECURITY CHECKLIST

- [ ] NEXTAUTH_SECRET is strong (use `openssl rand -base64 32`)
- [ ] DATABASE_URL uses strong password
- [ ] HTTPS enforced (auto on all platforms)
- [ ] Environment variables NOT in code (use cloud dashboard)
- [ ] .env.production NOT committed to git
- [ ] Secrets rotated quarterly
- [ ] CORS configured (if API exposed)
- [ ] Rate limiting enabled (optional)

---

## 10. TROUBLESHOOTING

### Issue: Container won't start
```bash
# Check logs
docker logs <container-id>

# Common fixes:
# 1. DATABASE_URL missing → Add to environment
# 2. NEXTAUTH_SECRET missing → Generate and add
# 3. Port 3000 already in use → Change port mapping
```

### Issue: Database connection timeout
```bash
# Check DATABASE_URL format
postgresql://user:password@host:5432/dbname

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules (cloud provider)
```

### Issue: RBAC redirects not working
```bash
# Check NEXTAUTH_URL matches domain exactly
# Check middleware.ts is being loaded
# Verify JWT contains 'role' field

curl -X POST https://yourdomain.com/api/auth/callback/credentials \
  -d "email=admin@example.com&password=..." \
  -H "Content-Type: application/x-www-form-urlencoded"
```

---

## 11. BACKUP & DISASTER RECOVERY

### 11.1 Database Backups

**Railway:**
```
Automatic daily backups included ✅
```

**DigitalOcean:**
```
Managed Database → Settings → Backups → Enable
```

**AWS RDS:**
```
Automated backups: 7 days retention (changeable)
Enable Multi-AZ for HA
```

### 11.2 Application Backup

```bash
# Keep Docker image tagged
docker tag bzionu:latest bzionu:backup-2026-02-04
docker push yourusername/bzionu:backup-2026-02-04

# Keep git history
git tag v1.0.0-production
git push origin v1.0.0-production
```

---

## 12. PERFORMANCE TUNING

### 12.1 Docker Image Size
```bash
# Current: ~250MB (Next.js + node_modules)
# Optimize: Multi-stage build ✅ (already in Dockerfile)
```

### 12.2 Database Queries
```bash
# Enable query logging in production (carefully)
# Prisma: export QUERY_ENGINE_LOG=trace

# Use connection pooling (Railway/DigitalOcean handles)
```

### 12.3 Caching
```bash
# Next.js caching: Automatic ✅
# Docker layer caching: Enabled ✅
# CDN: Use cloud provider's edge network
```

---

## 13. COST ESTIMATE (Monthly)

| Platform | Tier | Price | Includes |
|----------|------|-------|----------|
| **Railway** | Free | $0-5 | 5GB bandwidth, Postgres |
| **Railway** | Hobby | $5+ | Pay-as-you-go, scaling |
| **DigitalOcean** | Basic | $5 | 512MB RAM, 1 CPU, Postgres |
| **DigitalOcean** | Standard | $12 | 1GB RAM, 2 CPU, better performance |
| **AWS** | ECS Fargate | ~$10-30 | 256MB-1GB RAM, t4g.small |
| **AWS** | RDS | ~$15+ | PostgreSQL managed DB |

---

## 14. NEXT STEPS

1. **Choose Platform:** Railway (easiest) or DigitalOcean (best value)
2. **Create Account:** Sign up at chosen platform
3. **Set Secrets:** Generate NEXTAUTH_SECRET, prepare DATABASE_URL
4. **Deploy:** Follow platform-specific steps in section 3
5. **Test:** Visit https://yourdomain.com, test login flow
6. **Monitor:** Set up error tracking (Sentry), health checks

---

**Status:** ✅ Ready for Production Deployment

Questions? Check logs, verify environment variables, restart container.
