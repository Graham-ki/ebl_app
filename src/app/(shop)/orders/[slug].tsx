import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, SectionList, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { getMyOrder, getOrderProofs, updateReceiptStatus } from '../../../api/api';
import { uploadProofsOfPayment } from '../../../api/storage';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';

const OrderDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [proofs, setProofs] = useState<any[]>([]);
  const [loadingProofs, setLoadingProofs] = useState(false);
  const [receiptConfirmed, setReceiptConfirmed] = useState(false);
  const { data: order, error, isLoading } = getMyOrder(slug);

  const deleteProof = async (proofId: number) => {
    if (!proofId) return;

    try {
      // Step 1: Fetch the proof to get the file_url
      const { data: proof, error: fetchError } = await supabase
        .from('proof_of_payment')
        .select('file_url')
        .eq('id', proofId)
        .single();

      if (fetchError) {
        Alert.alert('Error', 'Failed to fetch proof details. Please try again.');
        return;
      }

      // Step 2: Extract the file path from the file_url
      const fileUrl = proof.file_url;
      const filePath = fileUrl.split('/storage/v1/object/public/app-images/')[1]; // Extract the file path

      if (!filePath) {
        Alert.alert('Error', 'Invalid file URL. Please contact support.');
        return;
      }

      // Step 3: Delete the file from the storage bucket
      const { error: deleteStorageError } = await supabase
        .storage
        .from('app-images') // Replace with your bucket name
        .remove([filePath]);

      if (deleteStorageError) {
        Alert.alert('Error', 'Failed to delete file from storage. Please try again.');
        return;
      }

      // Step 4: Delete the proof from the proof_of_payment table
      const { error: deleteTableError } = await supabase
        .from('proof_of_payment')
        .delete()
        .eq('id', proofId);

      if (deleteTableError) {
        Alert.alert('Error', 'Failed to delete proof from the database. Please try again.');
        return;
      }

      // Step 5: Remove the deleted proof from state
      setProofs((prevProofs) => prevProofs.filter((proof) => proof.id !== proofId));

      // Show success alert
      Alert.alert('Success', 'Proof and file deleted successfully!');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const fetchProofs = async () => {
      setLoadingProofs(true);
      const proofData = await getOrderProofs(order.id);
      setProofs(proofData);
      setLoadingProofs(false);
    };

    const checkReceiptStatus = () => {
      if (order?.receiption_status === 'Received') {
        setReceiptConfirmed(true);
      }
    };

    if (order?.id) {
      fetchProofs();
      checkReceiptStatus();
    }
  }, [order?.id]);

  if (isLoading) return <ActivityIndicator />;
  if (error || !order) return <Text>Error: {error instanceof Error ? error.message : error}</Text>;

  const sections = [
    {
      title: 'Order Items:',
      data: order.order_items,
      renderItem: ({ item }: any) => (
        <View style={styles.orderItem}>
          <Text style={styles.itemName}>{item.products.title}</Text>
          <Text>Boxes ordered: {item.quantity}</Text>
        </View>
      ),
    },
    {
      title: 'Payment receipts:',
      data: proofs,
      renderItem: ({ item }: any) => (
        <View style={styles.proofItem}>
          <Image source={{ uri: item.file_url }} style={styles.proofImage} />
          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteProof(item.id)}
          >
            <Text style={styles.deleteButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  const handleProofUpload = async () => {
    try {
      await uploadProofsOfPayment(order.id, order.user_id);
      const updatedProofs = await getOrderProofs(order.id);
      setProofs(updatedProofs);
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmReceipt = async () => {
    try {
      await updateReceiptStatus(order.id, 'Received');
      setReceiptConfirmed(true);
      alert('Order receipt confirmed!');
    } catch (error) {
      alert(`Failed to confirm receipt!`);
    }
  };

  return (
    <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <SectionList
          ListHeaderComponent={
            <>
              <Stack.Screen options={{ title: `${order.slug}` }} />
              <View style={styles.infoContainer}>
                <Text style={styles.orderSlug}>{order.slug}</Text>
              </View>
              <Text style={styles.details}>{order.description}</Text>
              <View style={[styles.statusBadge, styles[`statusBadge_${order.status}`]]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={handleProofUpload} style={styles.uploadButton}>
                  <Text style={styles.buttonText}>Add Payment slip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmReceipt}
                  style={[styles.confirmButton, receiptConfirmed && { backgroundColor: '#6c757d' }]}
                  disabled={receiptConfirmed}
                >
                  <Text style={styles.buttonText}>
                    {receiptConfirmed ? 'You Received' : 'Confirm Receipt'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>{format(new Date(order.created_at), 'MMM dd, yyyy')}</Text>
              </View>
            </>
          }
          sections={sections}
          keyExtractor={(item, index) => index.toString()}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
    </LinearGradient>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    backgroundColor: 'lightblue',
    borderColor: '#bee5eb',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    margin: 10,
  },
  orderSlug: {
    fontSize: 16,
    color: '#0c5460',
    textAlign: 'center',
  },
  details: {
    fontSize: 16,
    marginBottom: 16,
    marginHorizontal: 10,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginHorizontal: 10,
  },
  statusBadge_Pending: {
    backgroundColor: 'orange',
  },
  statusBadge_Completed: {
    backgroundColor: 'green',
  },
  statusBadge_Approved: {
    backgroundColor: 'blue',
  },
  statusBadge_Cancelled: {
    backgroundColor: 'red',
  },
  statusBadge_Balanced: {
    backgroundColor: 'teal',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    marginHorizontal: 10,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'transparent', // Ensure no background color
  },
  orderItem: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  proofItem: {
    marginBottom: 8,
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 10,
  },
  proofImage: {
    width: 250,
    height: 100,
    borderRadius: 5,
    marginTop: 8,
    alignSelf: 'center',
  },
  totalContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c5460',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 4,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});