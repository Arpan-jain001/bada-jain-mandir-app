import React from 'react';
import { Button, View } from 'react-native';
import useAuthGuard from '../../hooks/useAuthGuard';

export default function ProtectedActionExample() {
  const { requireAuth } = useAuthGuard();

  const onPressProtected = () => {
    requireAuth(() => {
      // actual protected action goes here
      // e.g., navigate to donation, open purchase flow, etc.
      console.log('Protected action executed');
      // You can navigate using expo-router if needed
    });
  };

  return (
    <View style={{ padding: 12 }}>
      <Button title="Protected Action" onPress={onPressProtected} />
    </View>
  );
}
