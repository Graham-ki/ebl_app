import { supabase } from '../lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
export const uploadProofsOfPayment = async (orderId: number, userId: string) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
    });
    if (result.canceled) {
      alert('File selection canceled.');
      return;
    }
    const files = result.assets || [result]; 
    for (const file of files) {
      if (!file.uri) {
        console.error('No file URI found.');
        alert('No file selected.');
        return;
      }
      const fileName = file.uri.split('/').pop();
      if (!fileName) {
        alert('Failed to extract file name.');
        return;
      }
      const timestamp = new Date().getTime();
      const uniqueFileName = `${timestamp}-${fileName}`;
      const fileType = file.name.split('.').pop();
      if (!fileType) {
        alert('Failed to extract file type.');
        return;
      }
      const contentType = `application/${fileType}`;
      const fileData = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const { error: uploadError } = await supabase.storage
        .from('app-images')
        .upload(`app-images/${uniqueFileName}`, Buffer.from(fileData, 'base64'), {
          contentType,
        });

      if (uploadError) {
        alert('Failed to upload file.');
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('app-images').getPublicUrl(`app-images/${uniqueFileName}`);
      const fileUrl = publicUrlData?.publicUrl;

      if (!fileUrl) {
        alert('Failed to get file URL.');
        return;
      }
      const { error: dbError } = await supabase
        .from('proof_of_payment')
        .insert({
          order_id: orderId,
          user_id: userId,
          file_url: fileUrl,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        alert('Failed to insert file record into database.');
        return;
      }
    }
    alert('Payment slip added successfully!');
  } catch (error) {
    alert('Failed to upload proofs of payment.');
  }
};
