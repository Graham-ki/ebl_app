import React, { useState } from 'react';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useCartStore } from '../../store/cart-store'; // Custom store for cart logic
import { getProduct } from '../../api/api'; // Custom API call for fetching product details

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const { data: product, error, isLoading } = getProduct(slug);
  const { items, addItem, incrementItem, decrementItem } = useCartStore();
  const cartItem = items.find(item => item.id === product?.id);
  const initialQuantity = cartItem ? cartItem.quantity : 0;
  const [quantity, setQuantity] = useState(initialQuantity);
  const [canExceedQuantity, setCanExceedQuantity] = useState(false); // Manage quantity check bypass

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text style={styles.errorMessage}>Error: {error.message}</Text>;
  if (!product) return <Redirect href='/404' />;

  const increaseQuantity = () => {
    if (quantity < product.maxQuantity || canExceedQuantity) {
      setQuantity(prev => prev + 1);
      incrementItem(product.id);
    } else {
      Alert.alert(
        'Quantity Limit Exceeded',
        'You are adding items beyond the available quantity. Your order may have to wait. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue Adding',
            onPress: () => {
              setCanExceedQuantity(true); // Allow unlimited increments after confirmation
              setQuantity(prev => prev + 1);
              incrementItem(product.id);
            },
          },
        ]
      );
    }
  };

  const decreaseQuantity = () => {
    if (quantity >= 1) {
      setQuantity(prev => prev - 1);
      decrementItem(product.id);
    }
  };

  const addToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      heroImage: product.heroImage,
      price: product.price,
      quantity,
      maxQuantity: product.maxQuantity,
      image: product.heroImage,
    });
    toast.show('Item added to cart', {
      type: 'success',
      placement: 'top',
      duration: 1500,
    });
  };

  const totalPrice = (product.price * quantity).toFixed();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product.title }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.card}>
          <Text style={styles.title}>{product.title}</Text>
          <Text>Use the - and + buttons to specify the number of boxes</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Box Price:</Text>
            <Text style={styles.price}>UGX {product.price.toFixed()}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total You will Pay:</Text>
            <Text style={styles.price}>UGX {totalPrice}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decreaseQuantity}
              disabled={quantity <= 0}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantity}>{quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={increaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[styles.addToCartButton, { opacity: quantity === 0 ? 0.5 : 1 }]}
          onPress={addToCart}
          disabled={quantity === 0}
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
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  priceLabel: {
    fontSize: 16,
    color: '#777',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  quantityButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
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
