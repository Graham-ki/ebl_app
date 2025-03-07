import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ToastProvider } from "react-native-toast-notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
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
            <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.gradient}>
              <SafeAreaView style={styles.container}>
                <StatusBar style="light" translucent backgroundColor="transparent" />
                <Stack>
                  <Stack.Screen name="(shop)" options={{ headerShown: false, title: 'Shop' }} />
                  <Stack.Screen name="categories" options={{ headerShown: false, title: 'Categories' }} />
                  <Stack.Screen name="product" options={{ headerShown: false, title: 'Products' }} />
                  <Stack.Screen name="cart" options={{ headerShown: false, title: 'Orders-Cart' }} />
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                </Stack>
              </SafeAreaView>
            </LinearGradient>
          </QueryProvider>
        </AuthProvider>
      </ToastProvider>
    </RefreshProvider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1, // Ensure the gradient covers the entire screen
  },
  container: {
    flex: 1,
  },
});