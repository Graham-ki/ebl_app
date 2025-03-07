import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { StyleSheet } from 'react-native';
import { useOrderUpdateSubscription } from '../../../api/subscriptions';
import React from 'react';

// Custom Header Background Component
const HeaderBackground = () => (
  <LinearGradient
    colors={["#00b09b", "#96c93d"]}
    style={StyleSheet.absoluteFill}
  />
);

export default function OrdersLayout() {
  useOrderUpdateSubscription();

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='[slug]'
        options={{
          headerShown: true,
          headerBackground: () => <HeaderBackground />, // Use custom header background
        }}
      />
      {/* Add other screens here if needed */}
    </Stack>

  );
}