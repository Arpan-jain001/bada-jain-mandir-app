# Quick Reference - Route Protection & Login Guard System

## 🔒 Using the Login Guard in Your Components

### Example 1: Protected Button Press
```typescript
import { requireLogin } from '../utils/authGuard';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => requireLogin(() => {
        // This code only runs if user is logged in
        router.push('/(protected)/user/donations');
      })}
    >
      <Text>Make a Donation</Text>
    </TouchableOpacity>
  );
}
```

### Example 2: Protected Gallery Access
```typescript
import { requireLogin } from '../utils/authGuard';

<TouchableOpacity
  onPress={() => requireLogin(() => {
    router.push('/(protected)/user/gallery');
  })}
>
  <Text>View Gallery</Text>
</TouchableOpacity>
```

### Example 3: Protected Event Registration
```typescript
const handleRegisterEvent = () => {
  requireLogin(async () => {
    try {
      await api.post('/events/register', { eventId });
      Alert.alert('Success', 'You are registered!');
    } catch (err) {
      Alert.alert('Error', 'Registration failed');
    }
  });
};

<TouchableOpacity onPress={handleRegisterEvent}>
  <Text>Register for Event</Text>
</TouchableOpacity>
```

---

## 🛡️ How Protected Routes Work

### Automatic Route Protection
No code needed! If user tries to access protected routes without login:

```typescript
// This is already protected by (protected)/_layout.tsx
// User will see alert and be redirected to login
router.push('/(protected)/user/profile');
```

### What Routes Are Protected?
- ✅ `/(protected)/user/*` - All user routes
- ✅ `/(protected)/admin/*` - All admin routes
- ❌ `/auth/login` - Public (no protection)
- ❌ `/auth/signup` - Public (no protection)

---

## 🔍 Checking Login State in Components

### Get Current Auth State
```typescript
import { useAuthStore } from '../stores/authStore';

export default function MyComponent() {
  const { user, token, initialized } = useAuthStore();

  if (!initialized) {
    return <ActivityIndicator />; // Still loading
  }

  if (!user) {
    return <Text>Not logged in</Text>;
  }

  return <Text>Welcome, {user.name}!</Text>;
}
```

### Check if User is Admin
```typescript
const { user } = useAuthStore();

if (user?.is_admin) {
  // Show admin controls
}
```

### Get Unread Notifications
```typescript
import { useUserNotificationStore } from '../stores/userNotificationStore';

const unreadCount = useUserNotificationStore((state) => state.unreadCount);
```

---

## 📱 Navigation Patterns

### Redirect to Login When Not Authenticated
```typescript
if (!user) {
  router.replace('/auth/login');
}
```

### Redirect to Protected Route When Authenticated
```typescript
if (user) {
  router.replace(user.is_admin ? '/(protected)/admin' : '/(protected)/user');
}
```

### Navigate Within Protected Routes
```typescript
// From user route to another user route
router.push('/(protected)/user/profile');

// From user route to another user route (relative)
router.push('profile');

// Back button (exists on detail screens)
router.back();
```

---

## 🎯 Login Flow Example

### Before (Without Protection)
```typescript
// User could navigate without checking auth
<TouchableOpacity onPress={() => router.push('/user/donations')}>
  <Text>Donate</Text>
</TouchableOpacity>
```

### After (With Protection)
```typescript
// User must be logged in
<TouchableOpacity
  onPress={() => requireLogin(() => {
    router.push('/(protected)/user/donations');
  })}
>
  <Text>Donate</Text>
</TouchableOpacity>

// OR if you just want routing to handle it:
<TouchableOpacity onPress={() => router.push('/(protected)/user/donations')}>
  <Text>Donate</Text>
</TouchableOpacity>
// User will see "Login Required" alert if not logged in
```

---

## 🚀 Common Use Cases

### Case 1: Show Different UI Based on Login State
```typescript
import { useAuthStore } from '../stores/authStore';

export default function HomeScreen() {
  const { user } = useAuthStore();

  return (
    <View>
      {user ? (
        <>
          <Text>Welcome back, {user.name}!</Text>
          {/* Show logged-in UI */}
        </>
      ) : (
        <>
          <Text>Please log in first</Text>
          {/* Show public UI */}
        </>
      )}
    </View>
  );
}
```

### Case 2: Protect Multiple Actions
```typescript
const handleDonate = () => requireLogin(onPressDonate);
const handleShare = () => requireLogin(onPressShare);
const handleRegister = () => requireLogin(onPressRegister);

return (
  <View>
    <Button onPress={handleDonate} title="Donate" />
    <Button onPress={handleShare} title="Share" />
    <Button onPress={handleRegister} title="Register" />
  </View>
);
```

### Case 3: Logout User
```typescript
import { useAuthStore } from '../stores/authStore';

const { logout } = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  Alert.alert('Logout', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Logout',
      style: 'destructive',
      onPress: async () => {
        await logout();
        router.replace('/auth/login');
      },
    },
  ]);
};

<TouchableOpacity onPress={handleLogout}>
  <Text>Logout</Text>
</TouchableOpacity>
```

---

## 🔄 Splash Screen Behavior

### Timeline on First Launch
```
0ms:    App starts → Native splash shows
50ms:   preventAutoHideAsync() called
100ms:  RootLayout renders (no blocking)
150ms:  Background: loadStoredAuth() starts
300ms:  AuthStore reads SecureStore
500ms:  initialized = true (if fast auth) OR timeout at 3000ms
600ms:  hideAsync() called when initialized = true
650ms:  Native splash fades
700ms:  UI appears (login or home)
```

### Key Points
- ✅ Splash visible minimum 500ms (natural feel)
- ✅ Maximum 3000ms (safety timeout)
- ✅ No artificial delays
- ✅ No re-bundling feel
- ✅ Smooth fade transition

---

## ⚠️ Common Mistakes & Fixes

### ❌ Wrong: Navigating to old route
```typescript
router.push('/user/donations');  // ❌ Won't work
```

### ✅ Right: Use (protected) group
```typescript
router.push('/(protected)/user/donations');  // ✅ Correct
```

### ❌ Wrong: Forgetting auth check
```typescript
<Button onPress={() => router.push('/(protected)/user/donations')} />
// If not logged in, user will see alert
```

### ✅ Right: Optional - wrap with requireLogin for UX
```typescript
<Button 
  onPress={() => requireLogin(() => {
    router.push('/(protected)/user/donations');
  })} 
/>
// Alert appears before routing
```

### ❌ Wrong: Using old store imports
```typescript
import { useAuthStore } from '../../stores/authStore';  // ❌
```

### ✅ Right: Correct import depth in protected routes
```typescript
// In (protected)/user/ routes:
import { useAuthStore } from '../../../stores/authStore';  // ✅

// In (protected)/admin/ routes:
import { useAuthStore } from '../../../stores/authStore';  // ✅

// In root app/ routes:
import { useAuthStore } from '../stores/authStore';  // ✅
```

---

## 📝 Checklist for New Protected Features

When adding a new protected feature:

- [ ] Route is under `/(protected)/user/` or `/(protected)/admin/`
- [ ] Import statements use correct depth (`../../../stores/`)
- [ ] Button/action uses `requireLogin(() => router.push(...))`
- [ ] Route guard in `(protected)/_layout.tsx` handles it
- [ ] User sees alert if not logged in
- [ ] Navigation redirects to login on unauthorized access

---

## 🧪 Testing Protected Routes

```typescript
// Test Case 1: Logged Out Access
1. Clear auth state (logout)
2. Try: router.push('/(protected)/user/profile')
3. Expected: "Login Required" alert, redirect to /auth/login

// Test Case 2: Logged In Access
1. Login with valid credentials
2. Try: router.push('/(protected)/user/profile')
3. Expected: Navigate to profile successfully

// Test Case 3: Button Protection
1. Not logged in
2. Tap button with requireLogin(() => { ... })
3. Expected: "Login Required" alert, option to login

// Test Case 4: Splash Timeline
1. Kill app completely
2. Open app
3. Expected: Splash visible ~500-1000ms, then UI appears
```

---

## 💡 Pro Tips

1. **Always use group routes for protected content:**
   ```typescript
   /(protected)/user/  ← Protected automatically
   /(protected)/admin/ ← Protected automatically
   ```

2. **Use requireLogin() for better UX on actions:**
   ```typescript
   // Shows alert before attempting action
   requireLogin(() => doExpensiveAction());
   ```

3. **Check initialization in detail screens:**
   ```typescript
   if (!initialized) return <Loading />;
   if (!user) return <Login />;
   // Safe to proceed
   ```

4. **Update imports when copying files:**
   ```typescript
   Find: ../../
   Replace: ../../../
   ```

5. **Test with production build for real experience:**
   ```bash
   npx expo run:android --no-dev --minify
   ```

---

## 📞 Quick Summary

| Action | Code |
|--------|------|
| Check if logged in | `const { user } = useAuthStore();` |
| Protect a button press | `onPress={() => requireLogin(() => { ... })}` |
| Navigate to protected route | `router.push('/(protected)/user/xyz')` |
| Navigate to login | `router.replace('/auth/login')` |
| Logout user | `await logout(); router.replace('/auth/login');` |
| Get unread notifications | `useUserNotificationStore(s => s.unreadCount)` |
| Show splash | Automatic on cold start |
| Hide splash | Automatic when `initialized = true` |

Done! You now have a complete login protection system. 🎉
