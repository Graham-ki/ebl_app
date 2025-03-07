import { ActivityIndicator, FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Link, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { Tables } from '../../../types/database.types';
import { getMyOrders } from '../../../api/api';
import { format } from 'date-fns';
import { useAuth } from '../../../providers/auth-provider';

const renderItem: ListRenderItem<Tables<'order'>> = ({ item }) => (
  <Link href={`/orders/${item.slug}`} asChild>
    <Pressable style={styles.orderContainer}>
      <View style={styles.orderContent}>
        <View style={styles.orderDetailsContainer}>
          <Text style={styles.orderItem}>{item.slug}</Text>
          <Text style={styles.orderDetails}>{item.description}</Text>
          <Text style={styles.orderDate}>{format(new Date(item.created_at), 'MMM dd, yyy')}</Text>
        </View>
        <View style={[styles.statusBadge, styles[`statusBadge_${item.status}`]]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
    </Pressable>
  </Link>
);

const Orders = () => {
  const { user } = useAuth(); // Ensure we access the user object directly

  // If user is not authenticated or user object is undefined/null
  if (!user || !user.id) {
    return (
      <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
        <View
          style={{
            backgroundColor: '#f8d7da', // Light red background for warning
            borderColor: '#f5c6cb', // Lighter red border
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            margin: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: '#721c24', // Darker red text for warning
              textAlign: 'center',
            }}
          >
            Please log in to view your orders.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const { data: orders, error, isLoading } = getMyOrders();

  if (isLoading) return <ActivityIndicator />;

  if (error || !orders) {
    return (
      <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center', margin: 10 }}>
          Something went wrong! {error?.message}
        </Text>
      </LinearGradient>
    );
  }

  if (!orders.length) {
    return (
      <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
        <View
          style={{
            backgroundColor: '#d1ecf1', // Light blue background (Bootstrap info)
            borderColor: '#bee5eb', // Lighter blue border
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            margin: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: '#0c5460', // Darker blue text (Bootstrap info)
              textAlign: 'center',
            }}
          >
            You have no orders yet!
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <View
          style={{
            backgroundColor: 'lightblue', // Light blue background (Bootstrap info)
            borderColor: '#bee5eb', // Lighter blue border
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            margin: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: '#0c5460', // Darker blue text (Bootstrap info)
              textAlign: 'center',
            }}
          >
            All YOUR ORDERS - tap to view details!
          </Text>
        </View>
        <Stack.Screen options={{ title: 'Orders' }} />
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      </View>
    </LinearGradient>
  );
};

export default Orders;

const styles: { [key: string]: any } = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  orderContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDetailsContainer: {
    flex: 1,
  },
  orderItem: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDetails: {
    fontSize: 14,
    color: '#555',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge_Pending: {
    backgroundColor: '#ffcc00',
  },
  statusBadge_Completed: {
    backgroundColor: '#4caf50',
  },
  statusBadge_Cancelled: {
    backgroundColor: 'red',
  },
  statusBadge_Approved: {
    backgroundColor: 'blue',
  },
  statusBadge_Balanced: {
    backgroundColor: 'teal',
  },
});