# Dave Techs Academy — Production Deployment Runbook & Architecture

**Product:** Dave Techs Academy\
**Version:** 1.0 Production Release\
**Scope:** Phase 25 — Deployment

---

## 1. Architecture Overview

```mermaid
graph TD
    User([Learners & Visitors]) -->|HTTPS / TLS 1.3| CDN[Cloudflare / Vercel Edge CDN]
    CDN -->|Static Assets & HTML| SPA[React Vite Production Bundle]
    SPA -->|Secure Public API| Paystack[Paystack Checkout Gateway]
    SPA -->|Async Webhooks / REST| Backend[Node.js / Serverless API Engine]
    Backend -->|Authoritative Data| DB[(Production Database - PostgreSQL)]
    Backend -->|Transactional Emails| Resend[Resend / SendGrid SMTP]
    Backend -->|SMS / WhatsApp| Termii[Termii Telecom Gateway]
    SPA -->|Telemetry Events| Analytics[GA4 / Telemetry Store]
    SPA -->|Exception Logging| Sentry[Sentry Error Monitoring]
```

---

## 2. Domain & DNS Configuration

| Type | Name / Host | Target / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (`devtechs.academy`) | `76.76.21.21` (Vercel) / VPS IPv4 | Auto / 300s | Primary Apex Domain |
| **CNAME** | `www` | `cname.vercel-dns.com` | Auto / 300s | WWW Subdomain Redirect |
| **CNAME** | `api` | `api.devtechs.academy` / Railway / AWS ALB | Auto / 300s | Authoritative Backend API |
| **TXT** | `@` | `v=spf1 include:resend.com ~all` | 3600s | Email SPF Deliverability |
| **CNAME** | `resend._domainkey` | `dkim.resend.com` | 3600s | DKIM Cryptographic Email Signature |
| **TXT** | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@devtechs.academy` | 3600s | DMARC Anti-Spoofing Policy |

---

## 3. Production Environment Variables

Configure these variables securely in your deployment host (Vercel, Netlify, Railway, or AWS Secrets Manager):

```env
# ── Frontend (Vite) ──
VITE_APP_ENV=production
VITE_SITE_URL=https://devtechs.academy
VITE_PAYSTACK_PUBLIC_KEY=pk_live_dta_prod_xxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_BASE_URL=https://api.devtechs.academy
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxxxxxxxxx@o000000.ingest.sentry.io/000000

# ── Backend / Serverless Secret Keys (NEVER expose to client) ──
NODE_ENV=production
DATABASE_URL=postgresql://devtechs_user:SecurePassword@db.devtechs.academy:5432/devtechs_production?sslmode=require
PAYSTACK_SECRET_KEY=sk_live_dta_xxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
TERMII_API_KEY=TLxxxxxxxxxxxxxxxxxxxxxxxx
JWT_SIGNING_SECRET=super_secret_jwt_signing_key_512bits
```

---

## 4. HTTPS & Security Headers

The production build includes strict security configurations across `vercel.json`, `netlify.toml`, and `nginx.conf`:

1. **HTTP Strict Transport Security (HSTS)**: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
2. **MIME Type Sniffing Prevention**: `X-Content-Type-Options: nosniff`
3. **Clickjacking Protection**: `X-Frame-Options: SAMEORIGIN`
4. **XSS Filter**: `X-XSS-Protection: 1; mode=block`
5. **Referrer Policy**: `Referrer-Policy: strict-origin-when-cross-origin`
6. **Hardware Permissions Policy**: `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 5. Paystack Live Production Setup

1. **API Keys**: Replace test public key with `pk_live_...` on frontend and `sk_live_...` on backend.
2. **Webhook URL**: Configure `https://api.devtechs.academy/api/paystack/webhook` in the Paystack Dashboard under Settings → API Configuration & Webhooks.
3. **IP Whitelisting**: Ensure webhook listener validates Paystack IP addresses (`52.31.139.229`, `52.49.173.169`, `52.214.14.220`) and HMAC SHA-512 signature header (`x-paystack-signature`).
4. **Idempotency**: All webhook transactions are deduplicated using payment references.

---

## 6. Email Service (Resend / SendGrid)

1. Verify domain `devtechs.academy` / `devtechs.ng` in Resend Dashboard.
2. Configure DNS records (SPF, DKIM, DMARC) with domain registrar.
3. Test delivery for all 7 branded email templates (Welcome, Application Received, Payment Receipt, Recovery, Class Reminder, Announcements, Custom Broadcasts).

---

## 7. Error Monitoring & Telemetry (Sentry / Analytics)

1. React runtime exceptions caught by `ErrorBoundary.tsx` and forwarded to Sentry.
2. User telemetry events streamed asynchronously without blocking the UI thread.
3. Admin Analytics Hub (`/admin/analytics`) provides live visibility into conversion funnels and device breakdown.

---

## 8. Deployment Commands & Verification

### Build Command:
```bash
npm run build
```

### Test Suite Verification:
```bash
npm test
```

### Docker Deployment:
```bash
docker build -t devtechs-academy:latest .
docker run -d -p 80:80 -p 443:443 devtechs-academy:latest
```

---

## 9. Post-Deployment Verification Checklist

- [x] HTTPS enforced with valid TLS certificate.
- [x] Canonical domain redirection (`http://` -> `https://`, `www.` -> apex).
- [x] All course pages, catalog filters, and search indexing operational.
- [x] Authentication flows (Signup, Login, Password Recovery) validated.
- [x] 6-Step Application wizard functional for Online and Physical campus cohorts.
- [x] Paystack live checkout modal and webhook receipt verification confirmed.
- [x] Learner Dashboard access and transaction receipt history confirmed.
- [x] Admin management portals (Courses, Students, Applications, Hubs, CRM, Analytics) operational.
- [x] Contact form and WhatsApp lead capture verified.
- [x] Mobile responsive UI verified on phones and tablets.
- [x] XML Sitemap (`/sitemap.xml`) and Robots (`/robots.txt`) verified for search engines.
