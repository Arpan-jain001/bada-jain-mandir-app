import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="gallery" />
      <Stack.Screen name="projects" />
      <Stack.Screen name="recent-work" />
      <Stack.Screen name="committee" />
      <Stack.Screen name="events" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="temple-video" />
      <Stack.Screen name="app-update" />
      <Stack.Screen name="donations" />
      <Stack.Screen name="live-darshan" />
    </Stack>
  );
}
