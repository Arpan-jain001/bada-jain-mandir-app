# Quick Reference Guide - Notification Automation System

## What Changed?

### Notifications Now Sent For:
| Feature | Trigger | Emoji | Example |
|---------|---------|-------|---------|
| **Projects** | Create + Status Change | 🚧🔨✅ | Temple Renovation Status: Ongoing |
| **Events** | Create + Status Change + Scheduled | 📅🔴✅❌ | Mahavir Jayanti Starting Now |
| **Recent Works** | Create | ✨ | New Temple Update Added |
| **Live Darshan** | Started | 🔴 | Live Darshan Started |
| **Gallery** | ❌ DISABLED | ❌ | No notifications |

---

## Admin UI Changes

### Events Screen
```
NEW FEATURES:
✓ Time Picker (HH:MM format)
✓ Status Dropdown (upcoming/ongoing/completed/cancelled)
✓ Status Badge on Cards with Emoji
✓ Auto-notification messaging
```

### Projects Screen  
```
NEW FEATURES:
✓ Status Dropdown (upcoming/ongoing/completed)
✓ Status Badge on Cards with Emoji
✓ Auto-notification messaging
```

---

## Backend Architecture

### New Files
1. `src/models/ScheduledNotification.js` - Stores scheduled jobs
2. `src/services/scheduledNotificationService.js` - Notification logic
3. `src/jobs/processScheduledNotifications.js` - Cron scheduler

### Modified Files
1. `package.json` - Added node-cron
2. `src/models/Content.js` - Added time/status fields
3. `src/controllers/contentController.js` - Removed gallery, added scheduling
4. `src/controllers/liveDarshanController.js` - Updated notification
5. `src/server.js` - Start cron job

---

## Key Features

### 1. Automatic Notifications
```
✓ Projects: Always send when created or status changes
✓ Events: Always send when created or status changes  
✓ Recent Works: Always send when created
✓ Live Darshan: Always send when started
✗ Gallery: Never send notifications
```

### 2. Scheduled Event Notifications
```
1. Admin creates event with date and time
2. System schedules notification for event start time
3. Cron job (every minute) checks for due notifications
4. At exact event time, notification sent automatically
5. All user preferences respected
```

### 3. Retry Logic
```
Attempt 1 fails → Retry after 5 minutes
Attempt 2 fails → Retry after 5 minutes
Attempt 3 fails → Mark as failed, stop retrying
```

---

## User Preferences Respected

**Event/Live Darshan notifications require:**
- eventEnabled = true
- pushEnabled = true
- quietMode = false
- deliveryMode = 'push' or 'both'

**Recent Works/Project notifications require:**
- announcementsEnabled = true (for projects)
- pushEnabled = true
- quietMode = false
- deliveryMode = 'push' or 'both'

---

## Deployment Steps

```bash
# 1. Backend
cd backend
npm install  # Installs node-cron
npm run dev  # Starts with cron job

# 2. Frontend (Optional - UI only)
cd frontend
npm install
expo start

# 3. No database migration needed
```

---

## Testing Quick Checks

### ✅ Should Work
```
POST /admin/events
{
  "title": "Event",
  "date": "2026-06-10",
  "time": "19:00",
  "status": "upcoming"
}
→ Notification sent immediately
→ Scheduled notification created for 19:00
```

```
POST /admin/projects
{
  "title": "Project",
  "status": "upcoming"
}
→ Notification sent immediately
```

```
POST /admin/recent-work
{
  "title": "Work",
  "description": "desc"
}
→ Notification sent immediately
```

### ❌ Should NOT Work
```
POST /admin/gallery
{
  "title": "Photo"
}
→ No notification sent
```

---

## Monitoring

### Check Pending Scheduled Notifications
```javascript
db.schedulednotifications.find({ status: 'pending' }).count()
```

### Check Failed Notifications
```javascript
db.schedulednotifications.find({ status: 'failed' }).pretty()
```

### Check Cron Execution (in logs)
```
"Scheduled notification processor ran: processed X, successful Y, failed Z"
```

---

## Files Modified Summary

| File | Changes |
|------|---------|
| package.json | +node-cron |
| Content.js | +status, +time fields |
| contentController.js | -gallery notify, +scheduling logic |
| liveDarshanController.js | +emoji, category fix |
| server.js | +cron startup |
| events.tsx | +time picker, +status dropdown |
| projects.tsx | +status dropdown |

---

## What's Preserved ✅

✓ Expo push notification system
✓ FCM token registration
✓ Notification listeners
✓ User preference system
✓ Admin authentication
✓ All existing APIs
✓ Email notification support

---

## Breaking Changes

❌ **None!** This is 100% backward compatible.

---

## Common Questions

**Q: Will old events lose data?**
A: No, fields have defaults. Old events work fine without time/status.

**Q: Can I disable auto-notifications?**
A: Gallery doesn't auto-notify. Others do, but users can disable via preferences.

**Q: What if cron job fails?**
A: Will retry every 5 minutes up to 3 times, then mark as failed.

**Q: Can I schedule notifications for past times?**
A: No, validation prevents it. Time must be in future.

**Q: Do email notifications still work?**
A: Yes, unchanged. Live Darshan can send email if requested.

**Q: What's the time format?**
A: 24-hour format: 07:00, 19:30, 23:59

**Q: What's the date format?**
A: YYYY-MM-DD: 2026-06-10

---

## Emoji Reference

| Emoji | Used For | Status |
|-------|----------|--------|
| 🚧 | Project | upcoming |
| 🔨 | Project | ongoing |
| ✅ | Project/Event | completed |
| 📅 | Event | upcoming |
| 🔴 | Event/Live | ongoing/started |
| ❌ | Event | cancelled |
| ✨ | Recent Work | any |

---

## Cron Job Details

```javascript
Schedule: Every minute (*/1 * * * *)
Batches:  Process up to 100 per run
Runs On:  Server startup automatically
Purpose:  Execute scheduled notifications at exact time
Logs:     Check server logs for "processor ran"
```

---

## Contact & Support

**For issues:**
1. Check deployment checklist
2. Review error logs
3. Check database for failed notifications
4. Verify user preferences
5. Check time/date format validation

**For questions:**
- Refer to API_USAGE_EXAMPLES.md
- Check DETAILED_FILE_CHANGES.md  
- See IMPLEMENTATION_SUMMARY.md

---

## Version Info

- **Date Implemented:** May 17, 2026
- **Node-cron Version:** ^3.0.3
- **Breaking Changes:** None
- **Database Migrations:** None required
- **New Dependencies:** 1 (node-cron)

---

## Success Indicators

After deployment:
- ✓ Projects trigger notifications
- ✓ Events trigger + schedule notifications
- ✓ Recent works trigger notifications
- ✓ Gallery doesn't trigger notifications
- ✓ Cron job runs every minute
- ✓ Scheduled notifications execute at exact time
- ✓ User preferences respected
- ✓ No errors in logs

---

## Next Steps

1. **Backend:** `npm install` and restart server
2. **Frontend:** Test admin UI (optional - no code required for basic use)
3. **Testing:** Follow DEPLOYMENT_TESTING_CHECKLIST.md
4. **Monitoring:** Check logs and dashboard regularly
5. **Support:** Refer to documentation as needed

---

## Additional Resources

- IMPLEMENTATION_SUMMARY.md - Complete overview
- DETAILED_FILE_CHANGES.md - Line-by-line changes
- API_USAGE_EXAMPLES.md - Usage examples and flows
- DEPLOYMENT_TESTING_CHECKLIST.md - Complete test guide
- REFACTORING_IMPLEMENTATION_PLAN.md - Project overview

---

**Implementation Status:** ✅ COMPLETE

All files created, modified, and documented. Ready for deployment!
