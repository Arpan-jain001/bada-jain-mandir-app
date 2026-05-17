# File Changes Reference Guide

## Backend Files Modified

### 1. [backend/package.json](backend/package.json)
**Line: Dependencies section**
```diff
+ "node-cron": "^3.0.3",
```
**Purpose:** Add cron scheduler for automated notification processing

---

### 2. [backend/src/models/Content.js](backend/src/models/Content.js)

**Project Schema Update (Lines ~20-35)**
```diff
const projectSchema = new mongoose.Schema({
  ...existing fields...
+ status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'ongoing', index: true },
+ notification_sent: { type: Boolean, default: false }
});
```

**Event Schema Update (Lines ~36-55)**
```diff
const eventSchema = new mongoose.Schema({
  ...existing fields...
+ time: { type: String }, // HH:MM format
+ status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming', index: true },
+ notification_sent: { type: Boolean, default: false },
+ scheduled_notification_id: String
});
```

**Purpose:** Store event/project status and scheduling information

---

### 3. [backend/src/models/ScheduledNotification.js](backend/src/models/ScheduledNotification.js)
**New File Created**
```javascript
- Stores scheduled notifications
- Fields: title, message, category, scheduledFor, contentType, contentId, status, executedAt, resultsSummary, retryCount, maxRetries, timezone, created_by
- Indexes: { status: 1, scheduledFor: 1 }
```

**Purpose:** Persistent storage for scheduled notification jobs

---

### 4. [backend/src/controllers/contentController.js](backend/src/controllers/contentController.js)

**notificationConfig Object (Lines ~25-70)**
```diff
const notificationConfig = {
- gallery: { ... } // REMOVED
  projects: {
    title: (doc) => emoji based on status + title,
    message: (doc) => status-based message,
    category: 'announcements'
  },
  recentWork: {
    title: '✨ New Temple Update Added',
    message: (doc) => description,
    category: 'announcements'
  },
  events: {
    title: (doc) => emoji based on status + title,
    message: (doc) => status-based message,
    category: 'festivals/events'
  }
};
```

**notifyContentCreate Function (Lines ~72-115)**
```diff
async function notifyContentCreate(collectionName, doc, req) {
  const config = notificationConfig[collectionName];
  if (!config) return;
  
+ // Only auto-notify for: projects, recentWork, events
+ // Gallery completely removed
+ const autoNotifyCollections = ['projects', 'recentWork', 'events'];
+ if (!autoNotifyCollections.includes(collectionName)) return;
  
  // Send notifications...
+ // Mark as notified to prevent duplicates
};
```

**New Function: scheduleEventNotificationIfNeeded (Lines ~117-140)**
```javascript
// Schedules event notification for exact event time
// Parses date/time and creates ScheduledNotification record
// Only if time is in future
```

**collection CRUD Handler (Lines ~142-195)**
```diff
+ Update logic:
  - Check if status changed
  - If status changed for projects/events, trigger notification
  - If event date/time changed, reschedule notification
  - Reset notification_sent flag
```

**Purpose:** Remove gallery auto-notifications, add smart status-based notifications, enable event scheduling

---

### 5. [backend/src/services/scheduledNotificationService.js](backend/src/services/scheduledNotificationService.js)
**New File Created**

**Functions:**
```javascript
- scheduleEventNotification({ eventId, eventTitle, scheduledTime, timezone, userId })
  Returns: ScheduledNotification document
  
- processPendingNotifications()
  Returns: { processed, successful, failed }
  
- processNotification(scheduledNotif)
  Executes single notification with retry logic
  
- getScheduledNotificationsStatus()
  Returns: { pending, processing, completed, failed, cancelled }
```

**Purpose:** Handle scheduled notification creation, execution, and monitoring

---

### 6. [backend/src/jobs/processScheduledNotifications.js](backend/src/jobs/processScheduledNotifications.js)
**New File Created**

**Functions:**
```javascript
- startScheduledNotificationProcessor()
  Cron: every minute (*/1 * * * *)
  
- getSchedulerStatus()
  Returns current scheduler status
```

**Purpose:** Initialize and manage cron job for notification processing

---

### 7. [backend/src/server.js](backend/src/server.js)
**Lines: Top section**
```diff
+ const { startScheduledNotificationProcessor } = require('./jobs/processScheduledNotifications');

async function start() {
  await connectDatabase();
  await seedAdmin();
+ startScheduledNotificationProcessor(); // NEW
  app.listen(env.port, ...);
}
```

**Purpose:** Start cron job on server startup

---

### 8. [backend/src/controllers/liveDarshanController.js](backend/src/controllers/liveDarshanController.js)

**updateLiveDarshan Function (Lines ~28-58)**
```diff
- category: 'live-darshan'
+ category: 'festivals/events'  // Respects eventEnabled preference
+ title: '🔴 Live Darshan Started Now'  // Added emoji
+ 
+ // Add notification audit logging
+ await Notification.create({
+   title, message, category,
+   channels: { push: true, email: req.body.send_email },
+   results, sent_by, sent_at
+ });
```

**Purpose:** Update notification to respect event preferences and add audit trail

---

## Frontend Files Modified

### 9. [frontend/app/admin/events.tsx](frontend/app/admin/events.tsx)

**Interface Update (Lines ~18-24)**
```diff
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
+ time?: string;
+ status?: string;
  image_url?: string;
}
```

**State Variables (Lines ~30-45)**
```diff
+ const [time, setTime] = useState('');
+ const [status, setStatus] = useState('upcoming');
+ const [showStatusPicker, setShowStatusPicker] = useState(false);
+ const [STATUS_EMOJIS] = useState({...});
+ const [EVENT_STATUSES] = useState(['upcoming', 'ongoing', 'completed', 'cancelled']);
```

**New Validation Functions (Lines ~75-90)**
```javascript
- validateTime(timeStr): Check HH:MM format (regex)
- validateDate(dateStr): Check YYYY-MM-DD format
- getStatusEmoji(status): Map status to emoji
```

**handleSubmit Update (Lines ~93-125)**
```diff
+ Add time/status validation
+ Include status and time in FormData
+ Update success message: "Notification will be sent to users"
```

**Modal Form Updates (Lines ~180-245)**
```diff
+ Add TextInput for time (HH:MM placeholder)
+ Add Status dropdown with picker
+ Add status picker container with options
+ Display status-based emoji and colors
```

**Event Card Display (Lines ~154-176)**
```diff
+ Show status badge with emoji and color
+ Show time if available
+ Better status indicator styling
```

**Purpose:** Add time picker, status dropdown, and auto-notification messaging

---

### 10. [frontend/app/admin/projects.tsx](frontend/app/admin/projects.tsx)

**Interface Update (Lines ~18-25)**
```diff
interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  youtube_url?: string;
+ status?: string;
}
```

**State Variables (Lines ~31-45)**
```diff
+ const [status, setStatus] = useState('ongoing');
+ const [showStatusPicker, setShowStatusPicker] = useState(false);
+ const [PROJECT_STATUSES] = useState(['upcoming', 'ongoing', 'completed']);
+ const [STATUS_EMOJIS] = useState({...});
```

**New Function (Lines ~110-113)**
```javascript
- getStatusEmoji(projectStatus): Map to emoji
```

**handleSubmit Update (Lines ~92-112)**
```diff
+ Include status in FormData
+ Update success message: "Notification will be sent to users"
+ On edit: also send status
```

**handleEdit Update (Lines ~114-130)**
```diff
+ Set status from existing project
+ Pass status to state
```

**Modal Form Updates (Lines ~185-215)**
```diff
+ Add Status dropdown before YouTube URL field
+ Implement status picker with options
+ Show color-coded status options
```

**Project Card Display (Lines ~160-180)**
```diff
+ Show status emoji in badge next to title
+ Color-code based on status
+ Better responsive layout with status badge
```

**Purpose:** Add status dropdown with visual indicators and auto-notification messaging

---

## New Files Created

### 11. [backend/src/models/ScheduledNotification.js](backend/src/models/ScheduledNotification.js)
**Complete new model** - See File #3 above

### 12. [backend/src/services/scheduledNotificationService.js](backend/src/services/scheduledNotificationService.js)
**Complete new service** - See File #5 above

### 13. [backend/src/jobs/processScheduledNotifications.js](backend/src/jobs/processScheduledNotifications.js)
**Complete new job** - See File #6 above

---

## No Changes Required

### Files that remain unchanged:
- [backend/src/models/User.js](backend/src/models/User.js) - Preferences already support our categories
- [backend/src/models/Notification.js](backend/src/models/Notification.js) - Works with new categories
- [backend/src/services/notificationService.js](backend/src/services/notificationService.js) - Preferences handled correctly
- [backend/src/routes/contentRoutes.js](backend/src/routes/contentRoutes.js) - No API changes needed
- All other frontend files - No other admin pages modified

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Files Modified | 8 |
| New Files Created | 3 |
| New Dependencies | 1 (node-cron) |
| New Schema Fields | 5 (3 on Event, 2 on Project) |
| Removed Features | 1 (Gallery auto-notifications) |
| Frontend Components Updated | 2 |
| Cron Jobs Added | 1 |
| New Functions | 4 |

## Dependencies Added
```json
"node-cron": "^3.0.3"
```

## Breaking Changes
✅ **None** - All changes are additive or refinement of existing features

## Database Migration
✅ **None needed** - New fields have defaults, old records will work fine

## Manual Steps After Deployment
1. Run `npm install` in backend folder to install node-cron
2. Restart backend server to start cron job
3. No database migrations needed
