import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    FlatList, 
    Image 
} from 'react-native';
import React from 'react';
import { useCartStore } from '../store/cart-store';
import { createOrder, createOrderItem } from '../api/api';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Import Icons

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
    
    const handleCheckout = async () => {
        const totalPrice = parseFloat(getTotalPrice());
  
        try {
            // Create the order without proof of payment
            await createSuperbaseOrder(
                {
                    totalPrice,
                },
                {
                    onSuccess: data => {
                        // Create order items
                        createSuperbaseOrderItem(
                            items.map(item => ({
                                orderId: data.id,
                                productId: item.id,
                                quantity: item.quantity,
                            })),
                            {
                                onSuccess: () => {
                                    alert('Your order has been sent!');
                                    resetCart();
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
  
            {/* Checkout Section */}
            <View style={styles.footer}>
                <Text style={styles.totalText}>Total: <Text style={styles.totalAmount}>UGX {getTotalPrice()}</Text></Text>
  
                <View style={styles.buttonRow}>
                    {/* Checkout Button */}
                    <TouchableOpacity 
                        onPress={items.length > 0 ? handleCheckout : null} 
                        style={[styles.checkoutButton, items.length === 0 && styles.disabledButton]} 
                        disabled={items.length === 0}
                    >
                        <FontAwesome name="shopping-cart" size={18} color="white" /> 
                        <Text style={styles.checkoutButtonText}>  Place order</Text>
                    </TouchableOpacity>
                </View>
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
  },
  totalAmount: {
      fontSize: 20,
      color: '#28a745',
  },
  buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  totalText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 12,
  },
  checkoutButton: {
      flex: 1,
      backgroundColor: '#28a745',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginLeft: 8,
  },
  checkoutButtonText: {
      color: '#fff',
      fontSize: 16,
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
