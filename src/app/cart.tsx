import { 
  Alert, 
  StyleSheet, 
  Text, 
  View, 
  StatusBar, 
  Platform, 
  TouchableOpacity, 
  FlatList, 
  Image 
} from 'react-native';
import React, { useState } from 'react';
import { useCartStore } from '../store/cart-store';
import { createOrder, createOrderItem } from '../api/api';
import * as ImagePicker from 'expo-image-picker';
import { uploadFileToSupabase } from '../api/storage';

type CartItemType = {
  id: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
};

type CartItemProps = {
  item: CartItemType;
  onRemove: (id: number) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
};

const CartItem = ({ item, onDecrement, onIncrement, onRemove }: CartItemProps) => {
  return (
      <View style={styles.cartItem}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPrice}>UGX {item.price.toFixed()}</Text>
              <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => onDecrement(item.id)} style={styles.quantityButton}>
                      <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => onIncrement(item.id)} style={styles.quantityButton}>
                      <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
              </View>
          </View>
          <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
      </View>
  );
};

export default function Cart() {
  const { items, removeItem, incrementItem, decrementItem, getTotalPrice, resetCart } = useCartStore();
  const { mutateAsync: createSuperbaseOrder } = createOrder();
  const { mutateAsync: createSuperbaseOrderItem } = createOrderItem();

  // State for proof of payment
  const [proofOfPayment, setProofOfPayment] = useState<string | null>(null);

  // Function to pick proof of payment
  const pickProofOfPayment = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          quality: 1,
      });

      if (!result.canceled) {
          setProofOfPayment(result.assets[0].uri);
      }
  };

  // Handle checkout with proof of payment
  const handleCheckout = async () => {
      if (!proofOfPayment) {
          alert('Please upload proof of payment!');
          return;
      }

      const totalPrice = parseFloat(getTotalPrice());

      try {
          // Upload proof of payment
          const proofUrl = await uploadFileToSupabase(proofOfPayment, 'app-images');

          await createSuperbaseOrder(
              {
                  totalPrice,
                  proofOfPayment: proofUrl, // Save proof of payment URL
              },
              {
                  onSuccess: data => {
                      createSuperbaseOrderItem(
                          items.map(item => ({
                              orderId: data.id,
                              productId: item.id,
                              quantity: item.quantity,
                          })),
                          {
                              onSuccess: () => {
                                  alert('Order created successfully!');
                                  resetCart();
                                  setProofOfPayment(null); // Reset proof of payment
                              },
                          }
                      );
                  },
              }
          );
      } catch (error) {
          console.log(error);
          alert('Failed to place order!');
      }
  };

  return (
      <View style={styles.container}>
          <StatusBar barStyle={Platform.OS === 'ios' ? 'light' : 'auto'} />

          {items.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                  <Image source={require('../../assets/images/empty-cart.png')} style={styles.emptyCartImage} />
                  <Text style={styles.emptyCartText}>No items in your cart!</Text>
              </View>
          ) : (
              <FlatList
                  data={items}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                      <CartItem item={item} onDecrement={decrementItem} onIncrement={incrementItem} onRemove={removeItem} />
                  )}
                  contentContainerStyle={styles.cartList}
              />
          )}
          {/* Checkout Button */}
          <View style={styles.footer}>
              <Text style={styles.totalText}>Total: UGX {getTotalPrice()}</Text>
               {/* Proof of Payment Upload */}
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
              {proofOfPayment ? (
                  <Text style={{ color: 'green' }}>File uploaded successfully</Text>
              ) : (
                  <TouchableOpacity onPress={items.length > 0 ?pickProofOfPayment:null} style={[styles.uploadButton,items.length === 0 && styles.disabledButton]}
                  disabled={items.length === 0}
                  >
                      <Text style={styles.uploadButtonText}>Add Payment</Text>
                  </TouchableOpacity>
              )}
          </View>
              <TouchableOpacity
                  onPress={items.length > 0 ? handleCheckout : null}
                  style={[styles.checkoutButton, items.length === 0 && styles.disabledButton]}
                  disabled={items.length === 0}
              >
                  <Text style={styles.checkoutButtonText}>Checkout</Text>
              </TouchableOpacity>
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingHorizontal: 16,
  },
  cartList: {
      paddingVertical: 16,
  },
  cartItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      padding: 16,
      borderRadius: 8,
      backgroundColor: '#f9f9f9',
  },
  itemImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
  },
  itemDetails: {
      flex: 1,
      marginLeft: 16,
  },
  itemTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
  },
  itemPrice: {
      fontSize: 16,
      color: '#888',
      marginBottom: 4,
  },
  itemQuantity: {
      fontSize: 14,
      color: '#666',
  },
  removeButton: {
      padding: 8,
      backgroundColor: '#ff5252',
      borderRadius: 8,
  },
  removeButtonText: {
      color: '#fff',
      fontSize: 14,
  },
  footer: {
      borderTopWidth: 1,
      borderColor: '#ddd',
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
  },
  totalText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
  },
  checkoutButton: {
      backgroundColor: '#28a745',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 8,
  },
  checkoutButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  },
  quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  quantityButton: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 15,
      backgroundColor: '#ddd',
      marginHorizontal: 5,
  },
  quantityButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  disabledButton: {
      backgroundColor: '#ccc',
  },
  uploadButton: {
      backgroundColor: '#007bff',
      padding: 12,
      borderRadius: 8,
  },
  uploadButtonText: {
      color: '#fff',
      fontWeight: 'bold',
  },
  emptyCartContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyCartImage: {
      width: 150,
      height: 150,
      marginBottom: 20,
  },
  emptyCartText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#666',
      textAlign: 'center',
  },
});
