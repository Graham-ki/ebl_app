import { Redirect, Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../../providers/auth-provider";
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import React from "react";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} {...props} style={{ color: "#1BC464" }} />;
}

const TabsLayout = () => {
  const { session, mounting } = useAuth();

  if (mounting) return <ActivityIndicator />;
  if (!session) return <Redirect href="/auth" />;

  return (
    <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#1BC464",
            tabBarInactiveTintColor: "grey",
            tabBarLabelStyle: {
              fontSize: 14, // Increased for better visibility
              fontWeight: "600",
            },
            tabBarStyle: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingVertical: 8, // Adjusted for better spacing
              marginBottom: 0,
              height: 60, // Increased for better visibility
              backgroundColor: "rgba(206, 252, 209, 0.9)", // Semi-transparent white background
            },
            tabBarItemStyle: {
              paddingBottom: 5, // Ensures label doesn't get cut off
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Shop",
              tabBarIcon(props) {
                return <TabBarIcon {...props} name="shopping-cart" />;
              },
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: "Orders",
              tabBarIcon(props) {
                return <TabBarIcon {...props} name="book" />;
              },
            }}
          />
        </Tabs>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});