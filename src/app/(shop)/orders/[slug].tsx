import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getMyOrder } from '../../../api/api';
import { format } from 'date-fns';

const OrderDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: order, error, isLoading } = getMyOrder(slug);

  if (isLoading) return <ActivityIndicator />;

  if (error || !order) return <Text>Error: {error?.message}</Text>;

  const orderItems = order.order_items.map((orderItem: any) => {
    return {
      id: orderItem.id,
      title: orderItem.products.title,
      heroImage: orderItem.products.heroImage,
      price: orderItem.products.price,
      quantity: orderItem.quantity,
    };
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${order.slug}` }} />
      <View  
    style={{
    backgroundColor: 'lightblue', // Light blue background (Bootstrap info)
    borderColor: '#bee5eb', // Lighter blue border
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    margin: 10,
      }}>
        <Text style={{
            fontSize: 16,
            color: '#0c5460', // Darker blue text (Bootstrap info)
            textAlign: 'center',
          }}>{order.slug}</Text>
      </View>
      <Text style={styles.details}>{order.description}</Text>
      <View style={[styles.statusBadge, styles[`statusBadge_${order.status}`]]}>
        <Text style={styles.statusText}>{order.status}</Text>
      </View>
      <Text style={styles.date}>
        {format(new Date(order.created_at), 'MMM dd, yyyy')}
      </Text>
      <View style={{flexDirection: 'row',justifyContent: 'space-between', alignItems: 'center',paddingVertical: 8,}}>
        <Text style={{fontSize: 16,
        fontWeight: 'bold',
        color: '#333',}}>Order Items:</Text>
        <Text style={{fontSize: 16,
        fontWeight: 'bold',
        color: '#ff5733',}}>Total amount: UGX {order.totalPrice}</Text>
      </View>
      
      <FlatList
        data={orderItems}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Image source={{ uri: item.heroImage }} style={styles.heroImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.title}</Text>
              <Text style={styles.itemPrice}>Unit price: UGX {item.price}</Text>
              <Text style={{}}>Quantity: {item.quantity}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default OrderDetails;

const styles: { [key: string]: any } = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  item: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    marginBottom: 16,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadge_Pending: {
    backgroundColor: 'orange',
  },
  statusBadge_Completed: {
    backgroundColor: 'green',
  },
  statusBadge_Approved: {
    backgroundColor: 'blue',
  },
  statusBadge_Cancelled: {
    backgroundColor: 'red',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginTop: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  heroImage: {
    width: '50%',
    height: 100,
    borderRadius: 10,
  },
  itemInfo: {},
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    marginTop: 4,
  },
});