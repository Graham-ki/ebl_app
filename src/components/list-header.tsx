import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useCartStore } from '../store/cart-store';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/database.types';
import React from 'react';

export const ListHeader = ({ categories }: { categories: Tables<'category'>[] }) => {
  const { getItemCount } = useCartStore();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  // Fetch the logged-in user's name
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: user, error } = await supabase.auth.getUser();
      if (user?.user) {
        // Fetch user details from your users table
        const { data, error } = await supabase
          .from('users')
          .select('name')
          .eq('email', user.user.email)
          .single();
        
        if (data) {
          setUserName(data.name);
        } else {
          setUserName('Guest');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Handle sign-out and clear session
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserName(null);
    setModalVisible(false); // Close the modal after signing out
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        {/* Left Side (User Avatar & Name) */}
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Image source={require('../../assets/images/logo.png')} style={styles.avatarImage} />
            <Text style={styles.avatarText}>
              {loading ? 'Loading...' : `Hello ${userName}`}
            </Text>
          </View>
        </View>

        {/* Right Side (Cart & Logout) */}
        <View style={styles.headerRight}>
          <Link href="/cart" style={styles.cartContainer} asChild>
            <Pressable>
              {({ pressed }) => (
                <View>
                  <FontAwesome
                    name="shopping-cart"
                    size={25}
                    color="grey"
                    style={{ marginRight: 25, opacity: pressed ? 0.5 : 1 }}
                  />
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{getItemCount()}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          </Link>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <FontAwesome name="sign-out" size={25} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image source={require('../../assets/images/banner.png')} style={styles.heroImage} />
      </View>

      {/* Categories List */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <Link asChild href={`/categories/${item.slug}`}>
              <Pressable style={styles.category}>
                <Text style={styles.categoryText}>{item.name}</Text>
              </Pressable>
            </Link>
          )}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Sign-Out Confirmation Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Proceed to sign out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.signOutButton]} 
                onPress={handleSignOut}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  headerContainer: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
  },
  cartContainer: {
    padding: 10,
  },
  heroContainer: {
    width: '100%',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    backgroundColor: '#ffffff', // White background color for the card
    paddingVertical: 15, // Padding on top and bottom
    paddingHorizontal: 25, // Padding on left and right
    borderRadius: 12, // Rounded corners
    shadowColor: '#000', // Shadow color
    shadowOpacity: 0.1, // Shadow opacity
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowRadius: 8, // Shadow spread
    elevation: 3, // Elevation for Android devices (to show shadow)
    marginBottom: 15, // Space between multiple cards
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center',
    
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    textAlign: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: 10,
    backgroundColor: '#1BC464',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 25,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'black',
  },
  signOutButton: {
    backgroundColor: 'red',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
