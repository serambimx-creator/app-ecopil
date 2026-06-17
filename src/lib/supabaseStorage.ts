import { supabase } from './supabase';

export async function uploadToSupabaseStorage(file: File, bucket: string = 'evidencias'): Promise<string> {
    try {
        const fileExt = file.name.split('.').pop() || 'tmp';
        // Cleanup file name to avoid weird characters
        const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const fileName = `${Date.now()}_${cleanName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error al subir a Supabase:', error);
            throw error;
        }

        // Obtener URL pública
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Fallo general al subir archivo:', err);
        throw err;
    }
}
