import { Stack } from "expo-router";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import React from "react";

// Custom Header Background Component
const HeaderBackground = () => (
  <LinearGradient
    colors={["#00b09b", "#96c93d"]}
    style={StyleSheet.absoluteFill}
  />
);

export default function CategoryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[slug]"
        options={({ navigation }) => ({
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerBackground: () => <HeaderBackground />, // Use custom header background
          headerTitleStyle: { color: 'white' }, // Set header title color to white
        })}
      />
    </Stack>
  );
}