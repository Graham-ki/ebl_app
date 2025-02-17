import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {ProductListItem} from '../../components/product-list-item'
import { ListHeader } from '../../components/list-header'
import { getProductsAndCategories } from '../../api/api'
const Home = () => {
  const {data,error,isLoading} = getProductsAndCategories();
  if(isLoading) return<ActivityIndicator/>;
  if(error || !data) return <Text>Error: {error?.message || "An error occurred"}</Text>;
  return (
    <View>
      <FlatList data={data.products} renderItem={({item})=>
        <ProductListItem product={item}/>}
      keyExtractor={item=>item.id.toString()}
      numColumns={2}
      ListHeaderComponent={<ListHeader categories={data.categories}/>}
      contentContainerStyle={styles.FlatListContent}
      columnWrapperStyle ={styles.FlatListColm}
      style={{paddingHorizontal:10,paddingVertical:5}}
      />
    </View>
  )
}
export default Home
const styles = StyleSheet.create({
  FlatListContent:{
    paddingBottom:20
  },
  FlatListColm:{
    justifyContent: 'space-between'
  }
})