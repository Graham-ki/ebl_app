import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';

export const uploadFileToSupabase = async (uri: string, bucket: string) => {
    const fileName = uri.split('/').pop();
    const fileType = fileName?.split('.').pop();

    const fileData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`payments/${fileName}`, Buffer.from(fileData, 'base64'), {
            contentType: fileType ? `image/${fileType}` : 'application/octet-stream',
        });

    if (error) throw error;

    return supabase.storage.from(bucket).getPublicUrl(`payments/${fileName}`).data.publicUrl;
};
