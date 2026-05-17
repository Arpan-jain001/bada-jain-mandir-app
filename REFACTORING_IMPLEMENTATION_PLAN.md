# Admin Notification Automation System - Implementation Plan

## Current System Analysis

### ✅ Working Components (PRESERVE)
- Expo push notification delivery (FCM + Expo tokens)
- User preference filtering (pushEnabled, eventEnabled, etc.)
- Token registration and management
- Notification listeners in frontend
- Admin authentication
- Existing API routes and schemas (add fields, don't restructure)

### ❌ Components to Fix
1. **Gallery auto-notifications** - DISABLE
2. **Event system** - Add status, time, scheduling
3. **Project system** - Add status field
4. **Scheduling** - No cron/background jobs yet

---

## Implementation Overview

### BACKEND CHANGES

#### 1. Install Dependencies
```json
"node-cron": "^3.0.3"
```

#### 2. Schema Updates

**Event Schema** - Add status and time:
```javascript
status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
time: { type: String } // HH:MM format like "07:00" or "19:30"
```

**Project Schema** - Add status:
```javascript
status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' }
```

**New ScheduledNotification Model**:
- Stores scheduled notifications
- Tracks execution status
- Prevents duplicates
- Handles retries

#### 3. Notification Logic Changes
- **Gallery**: Remove from `notificationConfig`
- **Projects**: Auto-send with title emoji based on status
- **Events**: Auto-send with title emoji based on status + scheduled for event time
- **Recent Works**: Auto-send on creation
- **Live Darshan**: Auto-send when started

---

### FRONTEND CHANGES

#### Admin UI Updates
- **Events**: Add date picker, time picker, status dropdown
- **Projects**: Add status dropdown
- Remove "notify" checkbox (always auto-send now)

---

## Files to Create

1. **Backend**:
   - `src/models/ScheduledNotification.js`
   - `src/services/scheduledNotificationService.js`
   - `src/jobs/processScheduledNotifications.js`

## Files to Modify

1. **Backend**:
   - `package.json` - Add node-cron
   - `src/models/Content.js` - Update Event and Project schemas
   - `src/controllers/contentController.js` - Remove gallery notifications, update config
   - `src/server.js` - Start cron job processor
   - `src/services/notificationService.js` - Add scheduled notification support

2. **Frontend**:
   - `app/admin/events.tsx` - Add date, time, status pickers
   - `app/admin/projects.tsx` - Add status dropdown
   - `app/admin/recent-work.tsx` - Add notify toggle removal
   - `app/admin/gallery.tsx` - Ensure no auto-notification

---

## Notification Rules After Refactoring

### Auto-Notifications (Automatic)
| Content Type | Trigger | Emoji | Respects Preferences |
|---|---|---|---|
| **Projects** | Create or status change | 🚧❌ | eventEnabled |
| **Events** | Create or status change | 📅🔴 | eventEnabled |
| **Recent Works** | Create | ✨ | announcementsEnabled |
| **Live Darshan** | Started | 🔴 | eventEnabled |

### No Auto-Notifications
| Content Type | Reason |
|---|---|
| Gallery uploads | User request |
| Image uploads only | Too frequent |
| Minor edits | Silent updates |

---

## Testing Checklist
- [ ] Gallery uploads don't trigger notifications
- [ ] Projects trigger notifications on create and status change
- [ ] Events trigger notifications on create and status change
- [ ] Event scheduled notifications send at exact time
- [ ] Recent Works trigger notifications on create
- [ ] Live Darshan triggers notification when started
- [ ] All respects user notification preferences
- [ ] Scheduled notifications retry on failure
- [ ] No duplicate notifications sent
- [ ] Expo/FCM push notifications still work
- [ ] Admin UI shows new fields
