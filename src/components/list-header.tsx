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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useCartStore } from '../store/cart-store';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/database.types';

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
      <StatusBar barStyle={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
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
                <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
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
  categoriesContainer: {},
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    width: 100,
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryText: {},
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
