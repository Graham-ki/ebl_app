import React, { useState } from 'react';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useCartStore } from '../../store/cart-store'; 
import { getProduct } from '../../api/api'; 

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const { data: product, error, isLoading } = getProduct(slug);
  const { items, addItem } = useCartStore();
  const cartItem = items.find(item => item.id === product?.id);
  const initialQuantity = cartItem ? cartItem.quantity : 0;
  const [quantity, setQuantity] = useState(initialQuantity.toString());

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text style={styles.errorMessage}>Error: {error.message}</Text>;
  if (!product) return <Redirect href='/404' />;

  const handleQuantityChange = (text: string): void => {
    // Allow only numeric input
    if (/^\d*$/.test(text)) {
      setQuantity(text);
    }
  };

  const addToCart = () => {
    const quantityNumber = parseInt(quantity, 10) || 0;

    addItem({
      id: product.id,
      title: product.title,
      quantity: quantityNumber,
      maxQuantity: product.maxQuantity,
    });
    toast.show('Item added to cart', {
      type: 'success',
      placement: 'top',
      duration: 1500,
    });
  };

  const totalPrice = (product.price * (parseInt(quantity, 10) || 0)).toFixed();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product.title }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.card}>
          <Text style={styles.title}>{product.title}</Text>
          <Text>Enter the number of boxes</Text>
          <View style={styles.quantityInputContainer}>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="numeric"
              placeholder="Enter quantity"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[styles.addToCartButton, { opacity: quantity === '0' || quantity === '' ? 0.5 : 1 }]}
          onPress={addToCart}
          disabled={quantity === '0' || quantity === ''}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  quantityInputContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  quantityInput: {
    width: 250,
    height: 40,
    borderColor: 'green',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCartButton: {
    width: '90%',
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorMessage: {
    fontSize: 18,
    color: '#f00',
    textAlign: 'center',
    marginTop: 20,
  },
});
