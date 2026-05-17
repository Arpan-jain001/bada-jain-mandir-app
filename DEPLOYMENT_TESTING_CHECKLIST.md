# Deployment & Testing Checklist

## Pre-Deployment Verification

### Backend Code Quality
- [ ] No syntax errors in modified files
- [ ] All imports are correct
- [ ] Functions exported properly
- [ ] No circular dependencies
- [ ] Environment variables properly referenced
- [ ] Error handling in place

### Frontend Code Quality  
- [ ] No TypeScript errors
- [ ] All imports resolved
- [ ] Components render without crashes
- [ ] Navigation works
- [ ] Forms validate input
- [ ] Success/error alerts display

### Dependencies
- [ ] `npm install` runs without errors
- [ ] `node-cron` version ^3.0.3 installed
- [ ] All peer dependencies satisfied
- [ ] No conflicting versions

---

## Deployment Steps

### 1. Backend Deployment
```bash
cd backend

# Install new dependency
npm install

# Verify no errors
npm list

# Check for syntax
node -c src/server.js

# Start in test mode
npm run dev
```

### 2. Frontend Deployment (if needed)
```bash
cd frontend

# Install dependencies
npm install

# Build verification
expo prebuild --clean

# Start local test
expo start
```

### 3. Database Check
```javascript
// MongoDB verification
db.admins.find().count()  // Should have at least 1

// Check new collections will be created
// (No migration needed, they're created on first write)
```

---

## Testing Checklist

### Backend Testing

#### 1. Server Startup
- [ ] Server starts without errors
- [ ] Port bound successfully
- [ ] No warnings in logs
- [ ] Cron job logs "Scheduled notification processor started"

#### 2. Gallery Upload (Should NOT Notify)
```bash
POST /admin/gallery
{
  "title": "Test Gallery",
  "image_data": "<base64>"
}
```
Expected:
- [ ] Image uploaded successfully
- [ ] No notification sent
- [ ] notification_sent field doesn't exist for gallery

#### 3. Project Creation (Should Notify)
```bash
POST /admin/projects
{
  "title": "Test Project",
  "description": "Test description",
  "status": "upcoming",
  "image_data": "<base64>"
}
```
Expected:
- [ ] Project created
- [ ] Notification sent with 🚧 emoji
- [ ] Notification logged in database
- [ ] notification_sent = true

#### 4. Event Creation with Time (Should Notify + Schedule)
```bash
POST /admin/events
{
  "title": "Test Event",
  "description": "Test event description",
  "date": "2026-06-20",
  "time": "19:00",
  "status": "upcoming",
  "image_data": "<base64>"
}
```
Expected:
- [ ] Event created
- [ ] Immediate notification sent with 📅 emoji
- [ ] ScheduledNotification record created
- [ ] scheduledFor = 2026-06-20T19:00:00Z
- [ ] status = 'pending'

#### 5. Event Creation without Time (Should Notify Only)
```bash
POST /admin/events
{
  "title": "Test Event 2",
  "description": "Test",
  "date": "2026-06-20",
  "status": "upcoming",
  "image_data": "<base64>"
}
```
Expected:
- [ ] Event created
- [ ] Notification sent
- [ ] No ScheduledNotification created (time missing)

#### 6. Project Status Change (Should Notify)
```bash
PUT /admin/projects/<id>
{
  "status": "completed"
}
```
Expected:
- [ ] Project updated
- [ ] New notification sent with ✅ emoji
- [ ] notification_sent = true

#### 7. Event Status Change (Should Notify)
```bash
PUT /admin/events/<id>
{
  "status": "ongoing"
}
```
Expected:
- [ ] Event updated
- [ ] New notification sent with 🔴 emoji
- [ ] If scheduled notification exists, it's updated

#### 8. Recent Work Creation (Should Notify)
```bash
POST /admin/recent-work
{
  "title": "Test Work",
  "description": "Test",
  "image_data": "<base64>"
}
```
Expected:
- [ ] Recent work created
- [ ] Notification sent with ✨ emoji

#### 9. Live Darshan Start (Should Notify)
```bash
PUT /live-darshan
{
  "title": "Test Live",
  "embed_code": "<iframe>...</iframe>",
  "is_live": true,
  "notify": true
}
```
Expected:
- [ ] Status updated
- [ ] Notification sent with 🔴 emoji
- [ ] Category = 'festivals/events'

#### 10. Cron Job Processing
```javascript
// Manually trigger by waiting or mocking time
// Check logs for: "Scheduled notification processor ran"
// Verify: processed count, successful count
```
Expected:
- [ ] Every minute cron runs (check logs)
- [ ] Pending notifications processed
- [ ] Status updated to 'completed'
- [ ] executedAt timestamp set

#### 11. User Preference Respect
Create event, then test with different users:
- [ ] User with eventEnabled=false doesn't receive
- [ ] User with pushEnabled=false doesn't receive
- [ ] User with quietMode=true doesn't receive
- [ ] User with deliveryMode='email' doesn't receive push

#### 12. Retry Logic
Simulate API failure:
- [ ] On first failure: retryCount=1, reschedule
- [ ] On second failure: retryCount=2, reschedule
- [ ] On third failure: retryCount=3, status='failed'
- [ ] No more attempts after 3 failures

---

### Frontend Testing

#### 1. Events Admin Screen
- [ ] Loads events list
- [ ] Add button opens modal
- [ ] Modal shows all fields
- [ ] **Time field present** ✓
- [ ] **Status dropdown present** ✓
- [ ] Date format validation works
- [ ] Time format validation works
- [ ] Success alert mentions notifications

#### 2. Event Form Validation
```
Valid inputs:
- Date: 2026-06-20 ✓
- Time: 19:00 ✓
- Title: Any text ✓
- Status: upcoming/ongoing/completed/cancelled ✓

Invalid inputs:
- Date: 06/20/2026 ✗ (Format error)
- Time: 19:30 AM ✗ (Format error)
- Time: empty ✓ (Optional)
```

#### 3. Event Card Display
- [ ] Shows event title
- [ ] Shows date
- [ ] **Shows time if available** ✓
- [ ] **Shows status badge with emoji** ✓
- [ ] Status color changes: 
  - 📅 upcoming = blue
  - 🔴 ongoing = red
  - ✅ completed = green
  - ❌ cancelled = gray

#### 4. Projects Admin Screen
- [ ] Loads projects list
- [ ] Add button opens modal
- [ ] **Status dropdown present** ✓
- [ ] All existing functionality works
- [ ] Success alert mentions notifications

#### 5. Project Form
- [ ] Title, description, image required
- [ ] **Status field required** ✓
- [ ] Status options show correctly
- [ ] Emoji displays correctly
- [ ] Can edit project and update status

#### 6. Project Card Display
- [ ] Shows title
- [ ] Shows description
- [ ] Shows image
- [ ] **Shows status emoji badge** ✓
- [ ] Status badge color codes properly:
  - 🚧 upcoming = blue
  - 🔨 ongoing = orange
  - ✅ completed = green

#### 7. Recent Work Screen
- [ ] Works as before
- [ ] No "notify" checkbox (removed auto-notify option)
- [ ] Adds recent work successfully

#### 8. Live Darshan Screen
- [ ] Embed code input works
- [ ] Go Live button works
- [ ] Stop Live button works
- [ ] Notifications sent when going live

---

## Database Inspection Commands

### Check New Collections Created
```javascript
// MongoDB
show collections
// Should eventually include: schedulednotifications
```

### Verify Event Documents
```javascript
db.events.findOne()
// Should have: time, status, notification_sent, scheduled_notification_id
```

### Verify Project Documents
```javascript
db.projects.findOne()
// Should have: status, notification_sent
```

### Check Scheduled Notifications
```javascript
db.schedulednotifications.find({}, { title: 1, status: 1, scheduledFor: 1 }).pretty()
```

### Check Notification Audit Log
```javascript
db.notifications.find({ category: 'festivals/events' }).sort({ created_at: -1 }).limit(10)
```

### View Failed Notifications
```javascript
db.schedulednotifications.find({ status: 'failed' }).pretty()
```

---

## Performance Testing

### Load Test: Create Multiple Events
```javascript
// Create 100 events simultaneously
for (let i = 0; i < 100; i++) {
  POST /events { title: `Event ${i}`, ... }
}
```
Expected:
- [ ] All succeed within 30 seconds
- [ ] No memory leaks
- [ ] Cron job still runs every minute
- [ ] Database indexes used (check explain plan)

### Stress Test: Cron Job with 1000 Pending Notifications
```javascript
// Create ScheduledNotifications with past times
db.schedulednotifications.insertMany([...1000 docs...])
```
Expected:
- [ ] Cron processes 100 at a time (batched)
- [ ] No timeout errors
- [ ] Completes within 1 minute
- [ ] Server remains responsive

---

## Monitoring & Logs

### What to Look For in Logs

**Good Signs:**
```
✓ "Scheduled notification processor started"
✓ "Scheduled notification processor ran" with stats
✓ "Successfully processed scheduled notification"
✓ "Scheduled event notification" 
✓ "Content notification successful"
```

**Bad Signs:**
```
✗ "Firebase Admin is not configured"
✗ "Error processing pending notifications"
✗ "Error in scheduled notification processor"
✗ "Failed to schedule event notification"
✗ "notifyContentCreate threw error"
```

### Enable Debug Mode
```javascript
// In env or server startup
process.env.DEBUG='app:*'

// Then look for detailed logs
```

---

## Rollback Procedure (If Needed)

### If issues occur after deployment:

1. **Stop the cron job** (temporary)
   - Remove call from server.js
   - Restart server

2. **Revert contentController.js**
   - Restore original notificationConfig
   - Revert collection() function

3. **Restore npm packages**
   - Remove "node-cron" from package.json
   - Run `npm install`

4. **Database cleanup**
   - Delete ScheduledNotification collection (optional)
   - Data is separate, won't affect events/projects

5. **Restart and test**
   - Verify events/projects still work
   - Check that notifications don't fail

---

## Post-Deployment Verification

After 24 hours:
- [ ] No error logs related to cron job
- [ ] Scheduled notifications processed successfully
- [ ] User reports receiving correct notifications
- [ ] No database performance degradation
- [ ] Admin interface responsive
- [ ] Mobile app still receives push notifications

After 1 week:
- [ ] Create events with future times (test scheduling)
- [ ] Verify notifications arrive at scheduled time
- [ ] Check failed notification count (should be 0 or very low)
- [ ] Verify user preference filtering works
- [ ] Gallery uploads still working (no notifications sent)

---

## Troubleshooting Guide

### Issue: Cron not starting
**Solution:** Check server logs for startup errors
```bash
npm run dev 2>&1 | grep -i "cron\|scheduled"
```

### Issue: Notifications not sending
**Solution:** Check Firebase/Expo configuration
```bash
# Verify env variables
echo $FIREBASE_...
echo $FCM_...
```

### Issue: Time validation failing
**Solution:** Ensure HH:MM format (24-hour)
```
Valid: 00:00 to 23:59
Invalid: 24:00, 23:60, 9:30 (should be 09:30)
```

### Issue: Events not scheduling
**Solution:** Check that time is in future
```javascript
// Date must be YYYY-MM-DD format
// Time must be HH:MM format
// scheduledTime must be > new Date()
```

### Issue: Database growth too fast
**Solution:** Archive old ScheduledNotification records
```javascript
// Move old completed notifications to archive collection
db.schedulednotifications.deleteMany({
  status: 'completed',
  executedAt: { $lt: new Date('2026-01-01') }
})
```

---

## Sign-Off Checklist

### Development
- [ ] All code changes reviewed
- [ ] No syntax errors
- [ ] Linting passed
- [ ] Unit tests passing (if applicable)

### Testing  
- [ ] All tests from checklist passed
- [ ] Edge cases handled
- [ ] Error scenarios tested
- [ ] Performance acceptable

### Documentation
- [ ] Implementation guide complete
- [ ] API examples provided
- [ ] File changes documented
- [ ] Rollback procedure documented

### Deployment
- [ ] Code merged to main branch
- [ ] Backup taken (if applicable)
- [ ] Deployment plan reviewed
- [ ] Team notified
- [ ] Monitoring enabled

### Post-Deployment
- [ ] All health checks pass
- [ ] Error logs reviewed
- [ ] User feedback collected
- [ ] Performance metrics normal
