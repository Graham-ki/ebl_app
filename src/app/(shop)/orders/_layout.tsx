import { Stack } from 'expo-router';

import { useOrderUpdateSubscription } from '../../../api/subscriptions';
import React from 'react';

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
    </Stack>
  );
}