import { StyleSheet,Image, Text, View, Pressable } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { Tables } from '../types/database.types'

export const ProductListItem = ({product}:{product:Tables<'product'>}) => {
  return (
    <Link asChild href={`/product/${product.slug}`}>
    <Pressable style={styles.item}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>
          {product.title}
        </Text>
        <Text style={styles.itemPrice}>
          Order now!
        </Text>
      </View>
    </Pressable>
    </Link>
  )
    
}

const styles = StyleSheet.create({
    item:{
       width:'48%',
       backgroundColor:'white',
       marginVertical:8,
       borderRadius:10,
       overflow:'hidden' 
    },
    itemImageContainer:{
      borderRadius:10,
      width:'100%',
      height:150
    },
    itemImage:{
      width:'100%',
      height:'100%',
      resizeMode: 'cover'
    },
    itemTextContainer:{
      padding:8,
      alignItems: 'center',
      gap:4,
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
    },
    itemTitle:{
      fontSize:16,
      color:'#888'
    },
    itemPrice:{
      fontSize: 14,
  fontWeight: 'bold',
  backgroundColor: 'lightgreen', 
  color: 'white', 
  paddingVertical: 6, 
  paddingHorizontal: 12, 
  borderRadius: 8, 
  textAlign: 'center', 
  cursor: 'pointer', 
  alignItems:'center'
    }
})