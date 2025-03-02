import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Animated } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, Stack } from "expo-router";
import { supabase } from "../lib/supabase";
import { Toast } from "react-native-toast-notifications";
import { useAuth } from "../providers/auth-provider";
import React, { useEffect, useRef } from "react";

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

  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade-in animation

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
    <ImageBackground source={require('../../assets/images/login.jpg')} style={styles.backgroundImage}>
      <View style={styles.overlay} />
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Please login to continue</Text>

        {/* Email Input */}
        <Controller
          control={control}
          name="email"
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => (
            <>
              <TextInput
                placeholder="Email"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                editable={!formState.isSubmitting}
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />

        {/* Password Input */}
        <Controller
          control={control}
          name="password"
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => (
            <>
              <TextInput
                placeholder="Password"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                secureTextEntry
                editable={!formState.isSubmitting}
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(signIn)}
          disabled={formState.isSubmitting}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 55,
    fontWeight: 'bold',
    color: 'lightgreen',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'lightgreen',
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    width: '90%',
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(202, 248, 193, 0.9)',
    borderRadius: 8,
    fontSize: 16,
    color: 'black',
    borderColor: 'green',
    borderWidth: 1,
  },
  button: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '90%',
    alignItems: 'center',
    borderColor: 'green',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'left',
    width: '90%',
  },
});