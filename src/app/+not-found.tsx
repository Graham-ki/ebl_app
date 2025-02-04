import { Link, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import React from 'react'
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! Page not found!." }} />
      <View style={styles.container}>
        <Link href="/home">Go to home page</Link>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
