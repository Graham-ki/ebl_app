import { View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, Stack } from "expo-router";
import { supabase } from "../lib/supabase";
import { Toast } from "react-native-toast-notifications";
import { useAuth } from "../providers/auth-provider";
import React, { useState, useEffect, useRef } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const authSchema = zod.object({
  email: zod.string().email({ message: 'Invalid email!' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters long!' }),
});

export default function Auth() {
  const { session } = useAuth();
  if (session) return <Redirect href='/' />;

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signIn = async (data: zod.infer<typeof authSchema>) => {
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      alert(error.message);
    } else {
      Toast.show('Signed in Successfully', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
    }
  };

  return (
    <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
        
        {/* Logo */}
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        
        {/* Welcome Message */}
        <Text style={styles.welcomeText}>Welcome </Text>
        <Text style={styles.subText}>Please login to continue</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="gray" style={styles.icon} />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Enter your email"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                editable={!formState.isSubmitting}
              />
            )}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="gray" style={styles.icon} />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Enter your password"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                secureTextEntry
                editable={!formState.isSubmitting}
              />
            )}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          onPress={handleSubmit(signIn)}
          style={styles.button}
          disabled={formState.isSubmitting} // Disable button when loading
        >
          <LinearGradient colors={["#ff9a9e", "#fad0c4"]} style={styles.buttonGradient}>
            {formState.isSubmitting ? (
              <ActivityIndicator color="#333" /> // Show spinner when loading
            ) : (
              <Text style={styles.buttonText}>Continue</Text> // Show text when not loading
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>EBL © 2025</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  inner: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
    borderRadius: 40
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(193, 243, 169, 0.9)", // Semi-transparent white background
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#000", // Black text color for visibility
    fontSize: 16,
  },
  button: {
    width: "100%",
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
  },
  buttonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: "#ddd",
  },
});