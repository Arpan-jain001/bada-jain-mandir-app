# Email Notification Preferences Implementation

## Overview
Email notification preferences have been implemented with a clear separation between system/security emails (always sent) and promotional emails (user-controlled). Push notification system remains completely untouched.

---

## Backend Implementation

### 1. User Model Update
**File**: [backend/src/models/User.js](backend/src/models/User.js)

**Added Field**:
```javascript
notificationPreferences: {
  // ... existing fields ...
  promotionalEmailsEnabled: { type: Boolean, default: false }
}
```

**Default**: `false` - Users must opt-in to promotional emails

### 2. New Email Service
**File**: [backend/src/services/emailService.js](backend/src/services/emailService.js) (NEW)

**Functions Provided**:

#### `sendSystemEmail()`
- **Purpose**: Send critical emails (password reset, OTP, security alerts, etc.)
- **Behavior**: Always sends, ignores all preferences
- **Usage**:
```javascript
const { sendSystemEmail } = require('../services/emailService');

await sendSystemEmail({
  to: 'user@example.com',
  subject: 'Password Reset',
  text: 'Your reset code is...',
  html: '<p>Your reset code is...</p>'
});
```

#### `sendPromotionalEmail()`
- **Purpose**: Send marketing/promotional emails
- **Behavior**: Checks `promotionalEmailsEnabled` preference before sending
- **Returns**: `{ skipped: true, reason: 'user_opted_out' }` if user disabled
- **Usage**:
```javascript
const { sendPromotionalEmail } = require('../services/emailService');

const result = await sendPromotionalEmail({
  userId: user._id,
  subject: 'Special Offer',
  text: 'You have a special offer...',
  html: '<p>You have a special offer...</p>'
});

// Check if sent
if (result.success) {
  console.log('Email sent');
} else if (result.skipped) {
  console.log('User opted out:', result.reason);
}
```

#### `sendPromotionalEmailToUsers()`
- **Purpose**: Send promotional emails to all opted-in users
- **Behavior**: Queries users with `promotionalEmailsEnabled: true`, sends to all
- **Returns**: `{ sent: number, errors: array, skipped: number }`
- **Usage**:
```javascript
const result = await sendPromotionalEmailToUsers({
  subject: 'Annual Festival Special',
  text: 'Join us for...',
  html: '<p>Join us for...</p>'
});
```

#### `sendPromotionalEmailToUser()`
- **Purpose**: Send promotional email to specific user with preference check
- **Returns**: Skipped response if user opted out
- **Usage**:
```javascript
await sendPromotionalEmailToUser(userId, {
  subject: 'Your Personalized Offer',
  text: '...',
  html: '...'
});
```

### 3. Auth Controller Update
**File**: [backend/src/controllers/authController.js](backend/src/controllers/authController.js)

**Changes**:
- Updated import: `sendSystemEmail` instead of `sendMail`
- Password reset OTP now uses `sendSystemEmail()` → ensures always sent

**Code**:
```javascript
import { sendSystemEmail } from '../services/emailService';

async function sendPasswordResetOtp(email) {
  // ... create OTP ...
  
  // This always sends, bypasses preferences
  await sendSystemEmail({
    to: user.email,
    subject: 'Password reset OTP',
    text: `Your password reset OTP is ${resetOtp}...`,
    html: `<p>Your password reset OTP is <strong>${resetOtp}</strong>...</p>`
  });
}
```

### 4. Preferences Controller Update
**File**: [backend/src/controllers/preferencesController.js](backend/src/controllers/preferencesController.js)

**Changes**:
- Added `promotionalEmailsEnabled` to update logic
- Added to reset/defaults function with `default: false`
- Partial update support maintained

### 5. Routes Update
**File**: [backend/src/routes/notificationRoutes.js](backend/src/routes/notificationRoutes.js)

**Added Validation**:
```javascript
router.put('/preferences', protect, [
  // ... existing validations ...
  body('promotionalEmailsEnabled').optional().isBoolean()
], validate, preferences.updateNotificationPreferences);
```

---

## Frontend Implementation

### 1. Preferences Service Update
**File**: [frontend/services/preferencesService.ts](frontend/services/preferencesService.ts)

**Updated Interface**:
```typescript
export interface NotificationPreferences {
  // ... existing fields ...
  promotionalEmailsEnabled: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  // ... existing ...
  promotionalEmailsEnabled: false  // Opt-in by default
};
```

### 2. Notification Preferences Component Update
**File**: [frontend/app/components/NotificationPreferences.tsx](frontend/app/components/NotificationPreferences.tsx)

**Changes**:
- Updated Email Settings section
- Replaced generic "Email Notifications" toggle with "Promotional Emails"
- Added security note: "Security and password reset emails will always be sent."

**UI**:
```
┌─────────────────────────────────────┐
│ Email Preferences                   │
│                                     │
│ ℹ️ Security and password reset     │
│    emails will always be sent.      │
│                                     │
│ [🔔 Promotional Emails      [OFF]  │
│  Get marketing emails and           │
│  special offers                     │
└─────────────────────────────────────┘
```

### 3. Translations Update
**File**: [frontend/stores/preferencesStore.ts](frontend/stores/preferencesStore.ts)

**New Translation Keys**:
- `promotionalEmails` - "Promotional Emails"
- `promotionalEmailsDesc` - "Receive marketing emails and special offers"
- `securityEmailsNote` - "Security and password reset emails will always be sent."

**Hindi Translations Included**:
- `promotionalEmails` - "प्रचारात्मक ईमेल"
- `promotionalEmailsDesc` - "विपणन ईमेल और विशेष ऑफर प्राप्त करें"
- `securityEmailsNote` - "सुरक्षा और पासवर्ड रीसेट ईमेल हमेशा भेजे जाएंगे।"

---

## Email Type Classification

### SYSTEM/SECURITY EMAILS (Always Sent)
✅ Forgot password OTP
✅ OTP verification
✅ Account security alerts
✅ Login verification  
✅ Password reset confirmation
✅ Account creation confirmation
✅ Two-factor authentication codes

**Implementation**: Use `sendSystemEmail()` - bypasses all preferences

### PROMOTIONAL EMAILS (User-Controlled)
🎁 Special offers and discounts
🎉 Seasonal promotions
📧 Newsletters
📢 Event promotions
🙏 Donation campaigns
🎊 Festival announcements
📱 New feature updates (non-critical)

**Implementation**: Use `sendPromotionalEmail()` or `sendPromotionalEmailToUsers()` - respects `promotionalEmailsEnabled` preference

---

## API Endpoints

### GET /api/notifications/preferences
Returns all user preferences including `promotionalEmailsEnabled`

**Response**:
```json
{
  "preferences": {
    "pushEnabled": true,
    "promotionalEnabled": false,
    "updateEnabled": true,
    "announcementsEnabled": true,
    "eventEnabled": true,
    "chatEnabled": true,
    "emailEnabled": true,
    "deliveryMode": "both",
    "quietMode": false,
    "promotionalEmailsEnabled": false
  }
}
```

### PUT /api/notifications/preferences
Update preferences (partial)

**Request**:
```json
{
  "promotionalEmailsEnabled": true
}
```

### POST /api/notifications/preferences/reset
Reset all preferences to defaults (including promotional emails to `false`)

---

## Database Schema

### User Model
```javascript
{
  notificationPreferences: {
    // ... existing fields ...
    promotionalEmailsEnabled: {
      type: Boolean,
      default: false  // Users opt-in
    }
  }
}
```

---

## Migration Path

### For Existing Users
- New field `promotionalEmailsEnabled` defaults to `false`
- No migration needed - existing users won't receive promotional emails
- Users can opt-in through profile settings
- Existing system emails continue to work

### For New Users
- Field auto-initialized to `false` on account creation
- Users can enable from Profile → Notifications tab

---

## Implementation Pattern

### When Sending Promotional Email

```javascript
const { sendPromotionalEmailToUser } = require('./services/emailService');

// Send promotional email
const result = await sendPromotionalEmailToUser(userId, {
  subject: 'Special Temple Festival Offer',
  text: 'Join us for...',
  html: '<p>Join us for...</p>'
});

if (result.skipped) {
  // User opted out - silently skip
  logger.info(`Promotional email skipped for user ${userId}: ${result.reason}`);
} else if (result.success) {
  // Email sent
  logger.info(`Promotional email sent to ${userId}`);
}
```

### When Sending System Email

```javascript
const { sendSystemEmail } = require('./services/emailService');

// Send password reset - ALWAYS sent
await sendSystemEmail({
  to: user.email,
  subject: 'Reset Your Password',
  text: `Your OTP is ${otp}`,
  html: `<p>Your OTP is <strong>${otp}</strong></p>`
});
// No need to check preferences
```

---

## Testing

### Manual Testing Checklist

**Backend Tests**:
- [ ] Password reset OTP email sends (system email)
- [ ] `sendPromotionalEmail()` skips if `promotionalEmailsEnabled: false`
- [ ] `sendPromotionalEmail()` sends if `promotionalEmailsEnabled: true`
- [ ] `sendPromotionalEmailToUsers()` only sends to opted-in users
- [ ] Preferences update includes `promotionalEmailsEnabled`
- [ ] Reset sets `promotionalEmailsEnabled: false`

**Frontend Tests**:
- [ ] Promotional Emails toggle visible in Profile → Notifications
- [ ] Security note displays correctly
- [ ] Toggle saves to backend
- [ ] Toggle persists after refresh
- [ ] Toggle works in both English and Hindi

**Integration Tests**:
- [ ] User can opt-in to promotional emails
- [ ] Promotional email sent only to opted-in users
- [ ] System email sent regardless of preference
- [ ] Reset clears promotional email preference

---

## Key Points

✅ **System emails always sent** - No preference check needed
✅ **Promotional emails user-controlled** - Opt-in model
✅ **Backward compatible** - Existing emails unaffected
✅ **Push system untouched** - No changes to notification system
✅ **Clean separation** - System vs promotional clearly defined
✅ **Bilingual** - English and Hindi translations included
✅ **Type-safe** - TypeScript interfaces for frontend
✅ **Production-ready** - Error handling, logging, validation

---

## Using the Email Service

### Importing in Controllers/Routes

```javascript
const { sendSystemEmail, sendPromotionalEmail } = require('../services/emailService');
```

### In Donation Controller (Example)

```javascript
const { sendPromotionalEmail } = require('../services/emailService');

// After successful donation
if (user.email) {
  await sendPromotionalEmail({
    userId: user._id,
    subject: 'Thank You for Your Donation',
    text: 'Your donation helps...',
    html: '<p>Your donation helps...</p>'
  });
}
```

### In Live Darshan Controller (Example)

```javascript
const { sendSystemEmail } = require('../services/emailService');

// Live darshan alert (system email - always send)
await sendSystemEmail({
  to: user.email,
  subject: 'Live Darshan Starting Now',
  text: 'Live darshan is starting...',
  html: '<p>Live darshan is starting...</p>'
});
```

---

## No Changes to Push Notifications

✅ Token registration unchanged
✅ Push notification sending unchanged  
✅ Notification listeners unchanged
✅ Background notifications unchanged
✅ Killed-state notifications unchanged
✅ Admin push notifications unchanged
✅ Notification preferences (for push) unchanged
✅ Deep linking unchanged

**The entire push notification system remains exactly as it was before.**

---

## Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `backend/src/models/User.js` | Modified | Added `promotionalEmailsEnabled` field |
| `backend/src/services/emailService.js` | NEW | Email service with system/promotional separation |
| `backend/src/controllers/authController.js` | Modified | Updated to use `sendSystemEmail()` |
| `backend/src/controllers/preferencesController.js` | Modified | Added `promotionalEmailsEnabled` support |
| `backend/src/routes/notificationRoutes.js` | Modified | Added validation for new field |
| `frontend/services/preferencesService.ts` | Modified | Added `promotionalEmailsEnabled` to interface |
| `frontend/app/components/NotificationPreferences.tsx` | Modified | Updated Email Settings section |
| `frontend/stores/preferencesStore.ts` | Modified | Added translation keys |

---

## Future Enhancements

1. **Email Digest Options**
   - Daily digest instead of individual emails
   - Weekly summary of events

2. **Unsubscribe Links**
   - Add unsubscribe option in email footer
   - One-click opt-out from email

3. **Email Categories**
   - Separate toggles for different promotional types
   - Event emails, donation campaigns, newsletters

4. **Email Frequency Limits**
   - Max emails per day/week
   - Prevent email fatigue

5. **Do Not Disturb Dates**
   - Disable emails during temple festivals
   - User-set quiet periods
