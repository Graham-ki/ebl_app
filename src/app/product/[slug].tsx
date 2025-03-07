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
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

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
    <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <Stack.Screen options={{ title: product.title }} />
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.card}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.description}>Enter the number of boxes</Text>
            <View style={styles.quantityInputContainer}>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                placeholder="Enter quantity"
                placeholderTextColor="#aaa"
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
    </LinearGradient>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
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
    color: '#333', // Dark text for better contrast
  },
  description: {
    fontSize: 16,
    color: '#555', // Dark text for better contrast
    marginBottom: 12,
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
    color: '#333', // Dark text for better contrast
    backgroundColor: '#fff', // White background for input
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Semi-transparent white background
    paddingVertical: 12,
    alignItems: 'center',
  
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