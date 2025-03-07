import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { ProductListItem } from '../../components/product-list-item';
import { ListHeader } from '../../components/list-header';
import { getProductsAndCategories } from '../../api/api';

const Home = () => {
  const { data, error, isLoading } = getProductsAndCategories();

  if (isLoading) return <ActivityIndicator />;
  if (error || !data) return <Text>Error: {error?.message || "An error occurred"}</Text>;

  return (
    <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <FlatList
          data={data.products}
          renderItem={({ item }) => <ProductListItem product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          ListHeaderComponent={<ListHeader categories={data.categories || []} />}
          contentContainerStyle={styles.FlatListContent}
          columnWrapperStyle={styles.FlatListColm}
          style={{ paddingHorizontal: 10, paddingVertical: 5 }}
        />
      </View>
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the gradient covers the entire screen
  },
  innerContainer: {
    flex: 1, // Ensure the inner container takes up the full space
  },
  FlatListContent: {
    paddingBottom: 20,
  },
  FlatListColm: {
    justifyContent: 'space-between',
  },
});