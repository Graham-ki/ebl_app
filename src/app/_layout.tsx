import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ToastProvider } from "react-native-toast-notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import {StyleSheet } from "react-native";
import AuthProvider from "../providers/auth-provider";
import QueryProvider from "../providers/query-provider";
import { Buffer } from 'buffer';
import React from "react";
import { RefreshProvider } from "../contexts/refreshcontext";
global.Buffer = Buffer;
export default function RootLayout() {
  return (
    <RefreshProvider>
      <ToastProvider>
      <AuthProvider>
        <QueryProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <Stack>
              <Stack.Screen name="(shop)" options={{ headerShown: false, title: 'Shop' }} />
              <Stack.Screen name="categories" options={{ headerShown: false, title: 'Categories' }} />
              <Stack.Screen name="product" options={{ headerShown: false, title: 'Products' }} />
              <Stack.Screen name="cart" options={{ presentation: 'modal', title: 'Orders-Cart' }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaView>
        </QueryProvider>
      </AuthProvider>
    </ToastProvider>
    </RefreshProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1BC464', 
  },
});
