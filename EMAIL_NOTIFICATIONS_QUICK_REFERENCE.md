# Email Notifications - Quick Reference

## One-Line Summary
Email notifications separated into **System (always sent)** and **Promotional (user-controlled)**.

---

## Quick Start

### Import Email Functions
```javascript
const { sendSystemEmail, sendPromotionalEmail, sendPromotionalEmailToUsers } = require('../services/emailService');
```

### Send System Email (Always Sent)
```javascript
await sendSystemEmail({
  to: 'user@example.com',
  subject: 'Password Reset OTP',
  text: 'Your OTP is 123456',
  html: '<p>Your OTP is <strong>123456</strong></p>'
});
// ✓ Always sends, no preference check
```

### Send Promotional Email (User-Controlled)
```javascript
const result = await sendPromotionalEmail({
  userId: user._id,
  subject: 'Special Offer',
  text: 'You have a special offer...',
  html: '<p>You have a special offer...</p>'
});

if (result.skipped) {
  console.log('User opted out of promotional emails');
} else {
  console.log('Promotional email sent');
}
```

### Send Promotional Email to All Opted-In Users
```javascript
const result = await sendPromotionalEmailToUsers({
  subject: 'Festival Special',
  text: 'Join us for...',
  html: '<p>Join us for...</p>'
});

console.log(`Sent to ${result.sent}, skipped ${result.skipped}`);
```

---

## File Locations

| Component | Location |
|-----------|----------|
| Email Service | `backend/src/services/emailService.js` |
| Preferences Ctrl | `backend/src/controllers/preferencesController.js` |
| Auth Ctrl | `backend/src/controllers/authController.js` |
| Routes | `backend/src/routes/notificationRoutes.js` |
| Frontend Service | `frontend/services/preferencesService.ts` |
| Component | `frontend/app/components/NotificationPreferences.tsx` |
| UI Strings | `frontend/stores/preferencesStore.ts` |

---

## Email Types at a Glance

| Email Type | Function | Preference Check |
|-----------|----------|------------------|
| Password Reset OTP | `sendSystemEmail()` | ❌ No |
| Account Security | `sendSystemEmail()` | ❌ No |
| Login Verification | `sendSystemEmail()` | ❌ No |
| Promotional Offers | `sendPromotionalEmail()` | ✅ Yes |
| Newsletters | `sendPromotionalEmailToUsers()` | ✅ Yes |
| Event Promotions | `sendPromotionalEmail()` | ✅ Yes |
| Donation Campaigns | `sendPromotionalEmailToUsers()` | ✅ Yes |

---

## API Changes

### Update Preferences
```
PUT /api/notifications/preferences
{ "promotionalEmailsEnabled": true }
```

### Get Preferences
```
GET /api/notifications/preferences
```

### Reset Preferences
```
POST /api/notifications/preferences/reset
```

---

## Database

**Field Added**: `User.notificationPreferences.promotionalEmailsEnabled`  
**Default Value**: `false` (users opt-in)

---

## Frontend Usage

### User sees this in Profile → Notifications tab:
```
Email Preferences
────────────────────────────────
ℹ️ Security and password reset emails
   will always be sent.

🔔 Promotional Emails [Toggle: OFF]
   Receive marketing emails and 
   special offers
```

### User Flow:
1. User opens Profile
2. Clicks Notifications tab
3. Finds Promotional Emails toggle
4. Toggles ON/OFF
5. Clicks Save Changes
6. Preference synced to backend

---

## Code Examples

### In Donation Controller
```javascript
const { sendPromotionalEmail } = require('../services/emailService');

async function recordDonation(req, res) {
  const user = req.user;
  
  // ... process donation ...
  
  // Send thank you email (promotional)
  await sendPromotionalEmail({
    userId: user._id,
    subject: 'Thank You for Your Donation',
    text: 'Your donation helps us...',
    html: '<p>Your donation helps us...</p>'
  });
  
  res.json({ success: true });
}
```

### In Auth Controller
```javascript
const { sendSystemEmail } = require('../services/emailService');

async function sendPasswordResetOtp(email) {
  // ... create OTP ...
  
  // System email - always sent
  await sendSystemEmail({
    to: email,
    subject: 'Password Reset OTP',
    text: `OTP: ${otp}`,
    html: `<p>OTP: <strong>${otp}</strong></p>`
  });
}
```

### In Admin Notification Controller
```javascript
const { sendPromotionalEmailToUsers } = require('../services/emailService');

async function broadcastPromotion(req, res) {
  const { subject, message } = req.body;
  
  const result = await sendPromotionalEmailToUsers({
    subject: subject,
    text: message,
    html: `<p>${message}</p>`
  });
  
  res.json({
    sent: result.sent,
    skipped: result.skipped,
    errors: result.errors
  });
}
```

---

## Validation

**User Preferences Endpoint Validation**:
```javascript
body('promotionalEmailsEnabled').optional().isBoolean()
```

---

## Return Values

### `sendSystemEmail()`
- ✅ Success: `{ success: true, result: ... }`
- ❌ Error: Throws exception

### `sendPromotionalEmail()`
- ✅ Sent: `{ success: true, result: ... }`
- ⏭️ Skipped: `{ skipped: true, reason: 'user_opted_out' }`
- ❌ Error: Throws exception

### `sendPromotionalEmailToUsers()`
- Returns: `{ sent: number, errors: [], skipped: number }`

---

## Common Mistakes to Avoid

❌ **Don't do this** - Using `sendMail()` directly for auth emails:
```javascript
await sendMail({ to, subject, text, html }); // No preference check!
```

✅ **Do this** - Use `sendSystemEmail()` for auth emails:
```javascript
await sendSystemEmail({ to, subject, text, html }); // Always sent
```

---

❌ **Don't do this** - Ignoring skipped response:
```javascript
await sendPromotionalEmail({ userId, subject, text, html });
// Might be skipped but no error handling
```

✅ **Do this** - Check if promotional email was sent:
```javascript
const result = await sendPromotionalEmail({ userId, subject, text, html });
if (result.success) {
  // Email was sent
} else if (result.skipped) {
  // User opted out - that's fine
}
```

---

## Translations

### English
- `promotionalEmails` - "Promotional Emails"
- `promotionalEmailsDesc` - "Receive marketing emails and special offers"
- `securityEmailsNote` - "Security and password reset emails will always be sent."

### Hindi
- `promotionalEmails` - "प्रचारात्मक ईमेल"
- `promotionalEmailsDesc` - "विपणन ईमेल और विशेष ऑफर प्राप्त करें"
- `securityEmailsNote` - "सुरक्षा और पासवर्ड रीसेट ईमेल हमेशा भेजे जाएंगे।"

---

## Architecture Diagram

```
User signs up
    ↓
notificationPreferences.promotionalEmailsEnabled = false (default)
    ↓
User opens Profile → Notifications
    ↓
Toggles "Promotional Emails"
    ↓
PUT /api/notifications/preferences
    ↓
Backend updates preference
    ↓
Admin sends promotional email
    ↓
IF promotionalEmailsEnabled === true
    → sendPromotionalEmail() → EMAIL SENT ✓
ELSE
    → sendPromotionalEmail() → SKIPPED (user_opted_out)
```

---

## Testing Endpoints

### Test 1: Get preferences
```bash
curl -X GET http://localhost:3000/api/notifications/preferences \
  -H "Authorization: Bearer TOKEN"
```

### Test 2: Enable promotional emails
```bash
curl -X PUT http://localhost:3000/api/notifications/preferences \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"promotionalEmailsEnabled": true}'
```

### Test 3: Send promotional email
```javascript
// In code:
const result = await sendPromotionalEmail({
  userId: 'user123',
  subject: 'Test Promo',
  text: 'This is a test',
  html: '<p>This is a test</p>'
});
console.log(result);
```

---

## No Changes Required To:

✓ Token registration
✓ Push notifications
✓ Notification listeners
✓ Background notifications  
✓ Killed-state notifications
✓ Admin push notifications
✓ Deep linking

**Push notification system is 100% untouched.**

---

## Default Behavior

| Scenario | Result |
|----------|--------|
| New user, system email | ✅ Sent |
| New user, promotional email | ⏭️ Skipped |
| User opts-in, promotional email | ✅ Sent |
| User opts-in, system email | ✅ Sent |
| User opts-out, promotional email | ⏭️ Skipped |
| User opts-out, system email | ✅ Sent |

---

## Production Checklist

- [ ] System emails using `sendSystemEmail()` ✓
- [ ] Promotional emails using `sendPromotionalEmail()` ✓
- [ ] Error handling added ✓
- [ ] Logging in place ✓
- [ ] User can toggle preferences ✓
- [ ] Preferences persist ✓
- [ ] Security note displayed ✓
- [ ] Translations complete ✓
- [ ] Tests passing ✓
- [ ] No push notification changes ✓
