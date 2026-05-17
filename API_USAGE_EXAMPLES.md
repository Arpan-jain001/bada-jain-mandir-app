# API Usage & Examples - Notification Automation System

## Event API Examples

### Create Event with Automatic Notification & Scheduling

**Request:**
```bash
POST /events
Content-Type: multipart/form-data

{
  "title": "Mahavir Jayanti Celebration",
  "description": "Annual celebration of Lord Mahavir's birthday",
  "date": "2026-06-10",
  "time": "19:00",
  "status": "upcoming",
  "image_data": <binary image>,
  "timezone": "UTC"
}
```

**Response (201 Created):**
```json
{
  "id": "evt_abc123def456",
  "title": "Mahavir Jayanti Celebration",
  "description": "Annual celebration of Lord Mahavir's birthday",
  "date": "2026-06-10",
  "time": "19:00",
  "status": "upcoming",
  "image_url": "https://cloudinary.com/...",
  "public_id": "...",
  "notification_sent": false,
  "scheduled_notification_id": "schd_xyz789",
  "is_active": true,
  "created_at": "2026-05-17T10:00:00Z",
  "updated_at": "2026-05-17T10:00:00Z"
}
```

**What Happens:**
1. Event created with status "upcoming"
2. Notification sent immediately to users: "📅 Mahavir Jayanti Celebration coming up..."
3. Scheduled notification created for 2026-06-10 19:00 UTC
4. At exactly 19:00 on June 10, all eligible users receive: "📅 Event Started: Mahavir Jayanti Celebration"

---

### Update Event Status (Triggers Notification)

**Request:**
```bash
PUT /events/evt_abc123def456
Content-Type: multipart/form-data

{
  "status": "ongoing"
}
```

**Response (200 OK):**
```json
{
  "id": "evt_abc123def456",
  "title": "Mahavir Jayanti Celebration",
  "status": "ongoing",
  "notification_sent": true,
  "...": "other fields"
}
```

**What Happens:**
1. Status updated to "ongoing"
2. Notification sent immediately: "🔴 Event Happening Now: Mahavir Jayanti Celebration"
3. Scheduled notification rescheduled if time/date changed

---

### Event Status Transitions & Notifications

```
CREATE: status='upcoming'
  → Sends: "📅 Mahavir Jayanti Celebration is coming up"
  → Schedules: Notification at event time

CHANGE: status='upcoming' → 'ongoing'
  → Sends: "🔴 Mahavir Jayanti Celebration is happening now"
  → Updates scheduled notification if needed

CHANGE: status='ongoing' → 'completed'
  → Sends: "✅ Mahavir Jayanti Celebration has finished"
  → Marks scheduled notification as executed

CHANGE: any → 'cancelled'
  → Sends: "❌ Mahavir Jayanti Celebration has been cancelled"
  → Cancels scheduled notification if pending
```

---

## Project API Examples

### Create Project with Automatic Notification

**Request:**
```bash
POST /projects
Content-Type: multipart/form-data

{
  "title": "Temple Renovation Project",
  "description": "Complete renovation of temple structure and interiors",
  "status": "upcoming",
  "youtube_url": "https://youtube.com/watch?v=...",
  "image_data": <binary image>
}
```

**Response (201 Created):**
```json
{
  "id": "proj_abc123def456",
  "title": "Temple Renovation Project",
  "description": "Complete renovation of temple structure and interiors",
  "status": "upcoming",
  "image_url": "https://cloudinary.com/...",
  "youtube_url": "https://youtube.com/watch?v=...",
  "notification_sent": true,
  "is_active": true,
  "created_at": "2026-05-17T10:00:00Z",
  "updated_at": "2026-05-17T10:00:00Z"
}
```

**What Happens:**
1. Project created with status "upcoming"
2. Notification sent immediately: "🚧 Temple Renovation Project is coming soon"
3. notification_sent flag set to true (prevents duplicate sends)

---

### Update Project Status

**Request:**
```bash
PUT /projects/proj_abc123def456
Content-Type: multipart/form-data

{
  "status": "ongoing"
}
```

**Response:**
```json
{
  "id": "proj_abc123def456",
  "status": "ongoing",
  "notification_sent": true,
  ...
}
```

**What Happens:**
1. Status updated to "ongoing"
2. Notification sent: "🔨 Temple Renovation Project is now underway"

---

### Project Status Flow & Notifications

```
CREATE: status='ongoing' (default)
  → Sends: "🚧 Temple Renovation Project is now underway"
  → Emoji: 🔨

CHANGE: status='ongoing' → 'completed'
  → Sends: "✅ Temple Renovation Project has been completed"
  → Emoji: ✅
```

---

## Recent Works API Examples

### Create Recent Work (Always Sends Notification)

**Request:**
```bash
POST /recent-work
Content-Type: multipart/form-data

{
  "title": "Temple Wall Painting",
  "description": "Beautiful new wall paintings installed in main prayer hall",
  "image_data": <binary image>,
  "youtube_url": "https://youtube.com/..."
}
```

**Response (201 Created):**
```json
{
  "id": "rw_abc123def456",
  "title": "Temple Wall Painting",
  "description": "Beautiful new wall paintings installed in main prayer hall",
  "image_url": "https://cloudinary.com/...",
  "notification_sent": true,
  ...
}
```

**What Happens:**
1. Recent work created
2. Notification sent: "✨ New Temple Update Added"
3. Shown to users with announcementsEnabled=true

---

## Live Darshan API Example

### Start Live Darshan

**Request:**
```bash
PUT /live-darshan
Content-Type: application/json

{
  "title": "Live Aarti Darshan",
  "embed_code": "<iframe src='https://youtube.com/embed/...'></iframe>",
  "is_live": true,
  "notify": true,
  "send_email": false
}
```

**Response:**
```json
{
  "id": "ld_abc123",
  "title": "Live Aarti Darshan",
  "embed_url": "https://youtube.com/...",
  "is_live": true,
  "started_at": "2026-05-17T18:30:00Z",
  "stopped_at": null
}
```

**What Happens:**
1. Live Darshan status updated to is_live=true
2. Notification sent: "🔴 Live Darshan Started Now"
3. Shown to users with eventEnabled=true

---

## Notification Scheduling System

### How Scheduled Notifications Work

**Timeline Example:**

```
2026-05-17 10:00 UTC
├─ Admin creates Event: "Mahavir Jayanti"
│  ├─ date: "2026-06-10"
│  ├─ time: "19:00"
│  └─ Immediate notification: "📅 Mahavir Jayanti is coming up"
│
└─ System creates ScheduledNotification:
   ├─ scheduledFor: 2026-06-10T19:00:00Z
   ├─ status: 'pending'
   └─ contentId: evt_abc123

2026-06-10 19:00 UTC (Cron Job Runs Every Minute)
├─ Cron finds pending notifications for this time
├─ Sends: "📅 Event Started: Mahavir Jayanti"
├─ Updates ScheduledNotification: status='completed', executedAt=now
└─ Marks Event: notification_sent=true
```

---

## Scheduled Notification Model

**Structure:**
```json
{
  "id": "schd_xyz789",
  "title": "📅 Event Started: Mahavir Jayanti",
  "message": "Mahavir Jayanti is starting now. Tap to view details.",
  "category": "festivals/events",
  "scheduledFor": "2026-06-10T19:00:00Z",
  "timezone": "UTC",
  "contentType": "event",
  "contentId": "evt_abc123",
  "status": "pending",  // pending → processing → completed/failed
  "executedAt": null,
  "resultsSummary": null,
  "failureReason": null,
  "retryCount": 0,
  "maxRetries": 3,
  "created_by": "admin_user_id",
  "created_at": "2026-05-17T10:00:00Z",
  "updated_at": "2026-05-17T10:00:00Z"
}
```

---

## Notification Filtering Rules

### User Preferences Applied

**Event Notifications** require:
- `notificationPreferences.pushEnabled` = true
- `notificationPreferences.eventEnabled` = true
- `notificationPreferences.quietMode` = false
- `notificationPreferences.deliveryMode` = 'push' or 'both'

**Recent Works Notifications** require:
- `notificationPreferences.pushEnabled` = true
- `notificationPreferences.announcementsEnabled` = true
- `notificationPreferences.quietMode` = false
- `notificationPreferences.deliveryMode` = 'push' or 'both'

---

## Error Handling & Retries

### Scheduled Notification Failure Flow

```
Execution Attempt 1:
├─ Firebase/Expo API fails
├─ Retry Count: 1
├─ Status: 'pending'
├─ Reschedule: 5 minutes later
└─ Next attempt: +5 minutes

Execution Attempt 2:
├─ Still fails
├─ Retry Count: 2
├─ Reschedule: 5 minutes later
└─ Next attempt: +10 minutes total

Execution Attempt 3:
├─ Still fails
├─ Retry Count: 3
├─ Status: 'failed'
├─ failureReason: Error message
└─ No more retries
```

---

## Admin Dashboard Hints

### Monitoring Scheduled Notifications

**To check pending notifications:**
```javascript
// In MongoDB
db.schedulednotifications.find({
  status: 'pending',
  scheduledFor: { $lte: new Date() }
});
```

**To check failed notifications:**
```javascript
db.schedulednotifications.find({
  status: 'failed'
}).limit(10);
```

**To get summary:**
```javascript
db.schedulednotifications.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

---

## What NOT to Expect

❌ **Gallery Uploads** - Do not trigger notifications
❌ **Minor Project Edits** - Only status changes trigger notifications
❌ **Quiet Mode Users** - Never receive auto-notifications
❌ **Disabled Preferences** - Users with eventEnabled=false don't get event notifications
❌ **Events Without Time** - Won't be scheduled (can be created without time)
❌ **Past Time Events** - Won't be scheduled (validation prevents it)

---

## Frontend Form Validation

### Time Input
```javascript
// Validates HH:MM format (24-hour)
Valid:   "07:00", "19:30", "23:59", "00:00"
Invalid: "7:00", "19:30 AM", "25:00", "19"
```

### Date Input
```javascript
// Validates YYYY-MM-DD format
Valid:   "2026-06-10", "2026-05-17"
Invalid: "06/10/2026", "2026-6-10", "June 10, 2026"
```

### Status Selection
```javascript
Events:  ['upcoming', 'ongoing', 'completed', 'cancelled']
Projects: ['upcoming', 'ongoing', 'completed']
```

---

## Backward Compatibility

All changes are **100% backward compatible**:

✅ Existing events without time still work
✅ Existing projects with no status use default
✅ Gallery continues to work (just no auto-notifications)
✅ User preferences system unchanged
✅ Notification delivery unchanged
✅ Admin authentication unchanged
✅ API endpoints same (just enhanced)

---

## Example Complete Flow

### Step-by-Step: Creating an Event That Auto-Notifies

1. **Admin goes to Events screen**
   - Taps + button
   - Fills in title, description, date, time
   - Selects status from dropdown
   - Picks image
   - Taps "Add"

2. **Frontend validates**
   - Title: required ✓
   - Description: required ✓
   - Date: YYYY-MM-DD format ✓
   - Time: HH:MM format ✓

3. **Request sent to backend**
   ```
   POST /events
   multipart/form-data with all fields
   ```

4. **Backend processes**
   - Uploads image to Cloudinary
   - Creates Event document
   - Calls `notifyContentCreate('events', doc, req)`
   - Finds all eligible users (eventEnabled=true, etc.)
   - Sends push notification: "📅 New event coming up"
   - Creates ScheduledNotification for event time

5. **Cron Job (at event time)**
   - Every minute checks for pending notifications
   - Finds ScheduledNotification with scheduledFor <= now
   - Sends push: "📅 Event Started: [Title]"
   - Updates ScheduledNotification.status = 'completed'

6. **User receives**
   - Immediate notification: Event announced
   - Scheduled notification: Event has started

✅ Complete end-to-end automation!
