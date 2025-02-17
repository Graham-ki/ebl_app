import { supabase } from '../lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Function to handle proof uploads
export const uploadProofsOfPayment = async (orderId: number, userId: string) => {
  try {
    // Allow the user to select multiple files
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,  // Allow multiple files
    });

    // Log the result for debugging
    console.log('Document Picker result:', result);

    if (result.canceled) {
      alert('File selection canceled.');
      return;
    }

    // Ensure result is not empty
    const files = result.assets || [result];  // Ensure it's an array if not multiple

    // Log the files array
    console.log('Selected files:', files);

    // Iterate through each selected file
    for (const file of files) {
      if (!file.uri) {
        console.error('No file URI found.');
        alert('No file selected.');
        return;
      }

      const fileName = file.uri.split('/').pop();
      if (!fileName) {
        console.error('File name extraction failed.');
        alert('Failed to extract file name.');
        return;
      }

      // Generate a unique file name to avoid name collisions
      const timestamp = new Date().getTime();
      const uniqueFileName = `${timestamp}-${fileName}`;

      const fileType = file.name.split('.').pop();
      if (!fileType) {
        console.error('File type extraction failed.');
        alert('Failed to extract file type.');
        return;
      }

      // Ensure file type is recognized
      const contentType = `application/${fileType}`;

      // Read the file as Base64
      const fileData = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('app-images')
        .upload(`app-images/${uniqueFileName}`, Buffer.from(fileData, 'base64'), {
          contentType,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Failed to upload file.');
        return;
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage.from('app-images').getPublicUrl(`app-images/${uniqueFileName}`);
      const fileUrl = publicUrlData?.publicUrl;

      if (!fileUrl) {
        console.error('Failed to retrieve file URL.');
        alert('Failed to get file URL.');
        return;
      }

      // Insert the file record into the proof_of_payment table
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

    alert('Payment added successfully!');
  } catch (error) {
    console.error('Error uploading proofs of payment:', error);
    alert('Failed to upload proofs of payment.');
  }
};
