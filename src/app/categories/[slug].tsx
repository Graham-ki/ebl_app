import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { ProductListItem } from '../../components/product-list-item';
import { getCategoryAndProducts } from '../../api/api';
import React from 'react';

const Category = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data, error, isLoading } = getCategoryAndProducts(slug);

  if (isLoading) return <ActivityIndicator />;
  if (error || !data) return <Text>Error: {error?.message}</Text>;
  if (!data.category || !data.products) return <Redirect href='/404' />;

  const { category, products } = data;

  return (
    <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <Stack.Screen options={{ title: category.name }} />
        <Text style={styles.categoryName}>Available {category.name}:</Text>

        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../../assets/images/empty-cart.png')} 
              style={styles.emptyImage}
            />
            <Text style={styles.noProductsText}>No products added yet!</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <ProductListItem product={item} />}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productsList}
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  categoryImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff', // White text for better contrast
  },
  productsList: {
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productContainer: {
    flex: 1,
    margin: 8,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#fff', // White text for better contrast
    fontWeight: 'bold',
    marginTop: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    resizeMode: 'contain',
  },
});