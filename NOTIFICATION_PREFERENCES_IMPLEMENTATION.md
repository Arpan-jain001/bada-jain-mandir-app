# Notification Preferences Implementation

## Overview
This document details the implementation of a comprehensive Notification Preferences section integrated into the existing Profile page.

## Architecture
- **No Duplication**: Notification preferences are integrated as a tab within the Profile page
- **Backward Compatible**: Extended existing User schema without breaking changes
- **Real-time Sync**: All preferences sync immediately with backend
- **Local Persistence**: Uses secure storage via Expo SecureStore
- **Multi-language Support**: Full English and Hindi translations

## Backend Implementation

### 1. User Model Update
**File**: `backend/src/models/User.js`

**Changes**: Extended notification preferences structure:
```javascript
notificationPreferences: {
  pushEnabled: Boolean (default: true),
  promotionalEnabled: Boolean (default: false),
  updateEnabled: Boolean (default: true),
  announcementsEnabled: Boolean (default: true),
  eventEnabled: Boolean (default: true),
  chatEnabled: Boolean (default: true),
  emailEnabled: Boolean (default: true),
  deliveryMode: String enum ['push', 'email', 'both'] (default: 'both'),
  quietMode: Boolean (default: false)
}
```

### 2. Notification Preferences Controller
**File**: `backend/src/controllers/preferencesController.js` (NEW)

**Endpoints Provided**:
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/preferences/reset` - Reset to defaults

**Features**:
- Partial updates supported
- Validation for deliveryMode values
- Returns updated preferences on success
- Proper error handling

### 3. Notification Service Updates
**File**: `backend/src/services/notificationService.js`

**Changes**:
- Updated field references to new preference names
- Added deliveryMode validation when sending emails/push
- Integrated quiet mode checks
- Category-specific preference checking (updates, announcements, events, etc.)

**Smart Delivery Logic**:
```
IF pushEnabled AND NOT quietMode THEN
  IF deliveryMode IN ['push', 'both'] THEN
    Send push notification
  
IF emailEnabled THEN
  IF deliveryMode IN ['email', 'both'] THEN
    Send email notification
```

### 4. Routes Update
**File**: `backend/src/routes/notificationRoutes.js`

**New Routes**:
```
GET  /preferences          - Retrieve user preferences
PUT  /preferences          - Update preferences (with validation)
POST /preferences/reset    - Reset to defaults
```

**Validation**:
- All boolean fields validated with `isBoolean()`
- DeliveryMode validated with `isIn(['push', 'email', 'both'])`

---

## Frontend Implementation

### 1. Preferences API Service
**File**: `frontend/services/preferencesService.ts` (NEW)

**Exports**:
- `NotificationPreferences` - TypeScript interface
- `getNotificationPreferences()` - Fetch from backend
- `updateNotificationPreferences(partial)` - Update preferences
- `resetNotificationPreferences()` - Reset to defaults
- `DEFAULT_PREFERENCES` - Default values constant

**Error Handling**:
- API errors logged to console
- Thrown for component handling

### 2. Notification Preferences Component
**File**: `frontend/app/components/NotificationPreferences.tsx` (NEW)

**Features**:
- Reusable, self-contained component
- Loading states during fetch and save
- Error handling with Alert dialogs
- Success feedback with Alert messages
- Reset confirmation dialog

**UI Sections**:
1. **Main Settings** - Master push notification enable/disable
2. **Notification Types** - Individual toggles for:
   - Promotional notifications
   - App updates
   - Announcements
   - Events
   - Chat messages

3. **Delivery Mode Selection** - Radio buttons for:
   - Push only
   - Email only
   - Both (push + email)

4. **Email Preferences** - Email notification toggle
5. **Quiet Mode** - Mute all notifications toggle

**Component Props**:
- `onSave?: () => void` - Callback after successful save
- `showHeader?: boolean` - Show/hide header (default: false)

**Styling**:
- Matches existing app design (orange/saffron theme)
- Elevation/shadows for depth
- Color-coded sections
- Responsive layout

### 3. Profile Page Integration
**File**: `frontend/app/(protected)/user/profile.tsx` (UPDATED)

**Changes**:
- Added tab navigation system (Profile | Notifications)
- Active tab state management
- Conditional rendering of content based on active tab
- Scrollable content for each tab
- Preserved existing profile functionality

**Tab Navigation**:
- Icons for visual clarity
- Active tab highlighted with orange accent
- Bottom border indicator
- Smooth transitions

### 4. Translation Strings
**File**: `frontend/stores/preferencesStore.ts` (UPDATED)

**New Translations Added** (English + Hindi):
- Notification preference labels
- Delivery mode options
- Section titles and descriptions
- Error and success messages
- Quiet mode explanations

**Total New Keys**: 45+ keys (bilingual)

---

## Data Flow

### Getting Preferences
```
User opens Profile → Notifications Tab
↓
NotificationPreferences component mounts
↓
useEffect calls loadPreferences()
↓
getNotificationPreferences() API call
↓
Response stored in component state
↓
UI renders with current preferences
```

### Updating Preferences
```
User toggles a preference
↓
State updated immediately
↓
User taps "Save Changes"
↓
updateNotificationPreferences() sends to backend
↓
PUT /api/notifications/preferences
↓
Backend validates and updates User document
↓
Success Alert shown
↓
State synced with backend response
```

### Resetting to Defaults
```
User taps "Reset to Defaults"
↓
Confirmation Alert shown
↓
If confirmed:
  resetNotificationPreferences() called
  ↓
  POST /api/notifications/preferences/reset
  ↓
  Backend resets all fields to defaults
  ↓
  Component state updated
  ↓
  Success message shown
```

---

## Testing Checklist

### Backend Tests
- [ ] GET /api/notifications/preferences returns user preferences
- [ ] PUT /api/notifications/preferences updates with partial object
- [ ] PUT validates deliveryMode enum values
- [ ] POST /api/notifications/preferences/reset restores defaults
- [ ] Unauthorized users (no auth token) get 401
- [ ] Invalid boolean values are type-coerced or rejected

### Frontend Tests
- [ ] Notification Preferences tab visible in Profile
- [ ] Toggle switches update local state immediately
- [ ] Delivery mode radio buttons work correctly
- [ ] Save button sends correct payload to API
- [ ] Loading spinner appears during save
- [ ] Success Alert shown after save
- [ ] Error Alert shown if save fails
- [ ] Reset button shows confirmation
- [ ] Reset works and updates all toggles
- [ ] All text supports both English and Hindi
- [ ] Component properly loads existing preferences
- [ ] Quiet mode toggle works
- [ ] UI is responsive on different screen sizes

### Integration Tests
- [ ] User can toggle push notifications and backend respects it
- [ ] Quiet mode prevents all notifications from sending
- [ ] Email delivery mode works for announcements
- [ ] Push delivery mode works for announcements
- [ ] Both mode sends both email and push
- [ ] Category-specific preferences respected:
  - [ ] Promotional notifications only if promotionalEnabled
  - [ ] Updates only if updateEnabled
  - [ ] Announcements only if announcementsEnabled
  - [ ] Events only if eventEnabled

---

## API Endpoints

### GET /api/notifications/preferences
**Authentication**: Required (JWT token)

**Response**:
```json
{
  "message": "Notification preferences retrieved",
  "preferences": {
    "pushEnabled": true,
    "promotionalEnabled": false,
    "updateEnabled": true,
    "announcementsEnabled": true,
    "eventEnabled": true,
    "chatEnabled": true,
    "emailEnabled": true,
    "deliveryMode": "both",
    "quietMode": false
  }
}
```

### PUT /api/notifications/preferences
**Authentication**: Required (JWT token)

**Request Body** (partial object):
```json
{
  "pushEnabled": true,
  "promotionalEnabled": false,
  "updateEnabled": true,
  "announcementsEnabled": true,
  "eventEnabled": true,
  "chatEnabled": true,
  "emailEnabled": true,
  "deliveryMode": "both",
  "quietMode": false
}
```

**Response**: Same as GET

### POST /api/notifications/preferences/reset
**Authentication**: Required (JWT token)

**Response**: Returns all preferences reset to defaults

---

## File Summary

### Backend Files
| File | Type | Status |
|------|------|--------|
| `src/models/User.js` | Modified | Updated notification preferences schema |
| `src/controllers/preferencesController.js` | New | Handles all preference operations |
| `src/services/notificationService.js` | Modified | Updated to use new preference fields |
| `src/routes/notificationRoutes.js` | Modified | Added preference endpoints |

### Frontend Files
| File | Type | Status |
|------|------|--------|
| `services/preferencesService.ts` | New | API service for preferences |
| `app/components/NotificationPreferences.tsx` | New | Reusable component |
| `app/(protected)/user/profile.tsx` | Modified | Added tab navigation |
| `stores/preferencesStore.ts` | Modified | Added 45+ translation keys |

---

## Backward Compatibility

The implementation is fully backward compatible:
- Old preference fields can still be read if present
- New preferences have sensible defaults
- Migration not required for existing users
- First-time access initializes with defaults

---

## Security Considerations

1. **Authentication**: All endpoints require JWT token
2. **Input Validation**: All inputs validated on backend
3. **Authorization**: Only users can access their own preferences
4. **Secure Storage**: Preferences stored securely with Expo SecureStore
5. **HTTPS Only**: All API calls use secure transport

---

## Performance Notes

- Preferences cached in component state (minimal re-fetches)
- Selective updates only send changed fields
- No unnecessary re-renders (optimized with state management)
- Loading states prevent multiple concurrent requests

---

## Future Enhancements

1. **Email Digest Options**: Daily/Weekly digest preferences
2. **Do Not Disturb Schedule**: Time-based quiet hours
3. **Per-Category Frequency**: Limit notifications per category
4. **Notification History**: View past notifications
5. **Notification Preview**: Preview before sending

---

## Preservation of Existing Systems

✅ **Token Registration**: Unchanged - continues to work as before
✅ **Push Notifications**: Enhanced with preference checking
✅ **Deep Linking**: Fully compatible with preferences
✅ **Notification Listeners**: Work with quiet mode
✅ **Background Notifications**: Respect delivery mode
✅ **Killed-State Notifications**: Honored by backend
✅ **Backend Notification Flow**: Fully integrated

---

## Documentation

All code includes:
- JSDoc comments for functions
- TypeScript interfaces for type safety
- Inline explanatory comments
- Error messages for user feedback
