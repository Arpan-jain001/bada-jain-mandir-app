# Environment Variables Configuration

## Resend Email Migration

After the email system refactor from Nodemailer SMTP to Resend API, your `.env` file configuration has changed.

---

## Required Environment Variables

### Email Service (NEW - Required)

```bash
# Resend API Key - Get from https://resend.com/api-keys
# Required for all email functionality
RESEND_API_KEY=re_your_api_key_here_123abc

# Sender Email Address - Must be from verified domain in Resend
# Examples: noreply@yourdomain.com, hello@yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
```

### Complete .env Template

```bash
# ============================================
# NODE.JS & SERVER
# ============================================
NODE_ENV=production
PORT=5000

# ============================================
# DATABASE
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=30d

# Admin credentials (set strong passwords in production)
ADMIN_NAME=Arpan Jain
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong-password-here
ADMIN_PHONE=+1234567890

# ============================================
# EMAIL SERVICE (Resend)
# ============================================
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# ============================================
# PAYMENT GATEWAY
# ============================================
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
DONATION_CURRENCY=INR

# ============================================
# CLOUD STORAGE
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# FIREBASE
# ============================================
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-adminsdk.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-service@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com

# ============================================
# MOBILE APP
# ============================================
ANDROID_PACKAGE_NAME=com.parham.jainmandir
PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.parham.jainmandir
INDUS_APPSTORE_URL=https://www.indusappstore.com/
INDUS_INSTALLER_PACKAGE=com.indus.appstore

# ============================================
# API & WEBSITE
# ============================================
API_BASE_URL=https://api.yourdomain.com
APP_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
WEBSITE_URL=https://yourdomain.com

# ============================================
# NOTIFICATIONS
# ============================================
FCM_ANDROID_CHANNEL_ID=temple_updates
```

---

## Getting RESEND_API_KEY

### 1. Create Resend Account
- Visit https://resend.com
- Sign up with your email
- Verify your email address

### 2. Obtain API Key
1. Go to Dashboard → API Keys
2. Click "Create API Key"
3. Choose scope: "Full Access"
4. Copy the generated key (starts with `re_`)

### 3. Verify Sender Domain
Before sending emails, verify your sender domain:

1. In Resend Dashboard → Domains
2. Click "Add Domain"
3. Follow DNS verification steps
4. Use domain in `EMAIL_FROM` variable

**For Testing Only:**
```bash
# Resend provides a test domain (valid for testing only)
EMAIL_FROM=onboarding@resend.dev  # For testing
```

**For Production:**
```bash
# Use your verified domain
EMAIL_FROM=noreply@yourdomain.com
```

---

## Variable Reference

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| `RESEND_API_KEY` | String | ✅ Yes | `re_abc123xyz789` |
| `EMAIL_FROM` | Email | ✅ Yes | `noreply@yourdomain.com` |
| `MONGODB_URI` | URL | ✅ Yes | `mongodb+srv://...` |
| `JWT_SECRET` | String | ✅ Yes | `your-secret-key` |
| `RAZORPAY_KEY_ID` | String | ✅ Yes | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | String | ✅ Yes | `...` |
| `FIREBASE_PROJECT_ID` | String | ✅ Yes | `project-id` |
| `CLOUDINARY_CLOUD_NAME` | String | ⚠️ For images | `cloud-name` |

---

## Deployment on Render

### Step 1: Set Environment Variables in Render
```
Dashboard → Select Service → Settings → Environment
```

Add these variables:
```
RESEND_API_KEY=re_your_key
EMAIL_FROM=noreply@yourdomain.com
```

**Include all other variables** from the template above.

### Step 2: Deploy
```bash
git push origin main
# Render automatically deploys
```

### Step 3: Verify
```bash
# In Render Logs, you should see:
# ✅ Email service initialized
# ✅ Server running on port 5000
```

---

## Migrating From Nodemailer

### Old Variables (Remove These)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=noreply@yourdomain.com
```

### New Variables (Add These)
```bash
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Update Steps
1. Remove all `SMTP_*` variables from `.env`
2. Add `RESEND_API_KEY` (from Resend dashboard)
3. Add `EMAIL_FROM` (your verified sender)
4. Restart server
5. Test password reset email
6. Test donation receipt

---

## Security Best Practices

### 1. Never Commit .env File
```bash
# In .gitignore
.env
.env.local
.env.*.local
```

### 2. API Key Security
```bash
# ✅ DO THIS
RESEND_API_KEY=re_xxxxxxxxxxxxx  # In Resend dashboard only

# ❌ NEVER DO THIS
git commit .env  # Don't version control secrets
console.log(env.email.apiKey)  # Don't log API keys
```

### 3. Rotate Keys Regularly
- Monthly for development environments
- Quarterly for production
- Immediately if leaked

### 4. Use Key Restrictions
In Resend Dashboard → API Keys → Settings:
- Restrict to domains
- Set IP whitelist (if needed)
- Review last used date

---

## Troubleshooting

### "RESEND_API_KEY is not configured"
**Problem:** Server can't find the API key

**Solution:**
```bash
# 1. Check .env file exists
ls -la backend/.env

# 2. Verify key is set
grep RESEND_API_KEY backend/.env

# 3. Check syntax
# Key should be: RESEND_API_KEY=re_xxxxx (no quotes)

# 4. Restart server
npm run dev
```

### "Invalid API key"
**Problem:** API key format is wrong

**Solution:**
- Copy key directly from https://resend.com/api-keys
- Ensure no extra spaces: `RESEND_API_KEY=re_xxx` (not `= re_xxx`)
- Check if key is active (not revoked)

### "Email address not from your domain"
**Problem:** `EMAIL_FROM` is not verified

**Solution:**
1. Go to Resend Dashboard → Domains
2. Verify your domain's DNS
3. Or use test domain: `EMAIL_FROM=onboarding@resend.dev`

### "Rate limit exceeded"
**Problem:** Too many emails sent

**Solution:**
- Resend default: 1000 emails/day
- Contact support for higher limits
- Implement request throttling in app

---

## Testing

### Test Email Sending
```bash
# In backend directory
node -e "
const {sendMail} = require('./src/services/mailService');
const env = require('./src/config/env');

console.log('Email Config:', {
  apiKey: env.email.apiKey ? '✅ Set' : '❌ Missing',
  from: env.email.from
});

// Test send (will fail without valid key, but shows config)
"
```

### Test Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check email in Resend dashboard
```

---

## Reference Links

- **Resend API Docs:** https://resend.com/docs
- **API Keys:** https://resend.com/api-keys  
- **Email Templates:** https://resend.com/docs/templates
- **Domain Verification:** https://resend.com/docs/domains
- **Webhook Events:** https://resend.com/docs/webhooks

---

**Configuration Status: ✅ READY FOR PRODUCTION**
