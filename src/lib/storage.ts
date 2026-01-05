import { supabase } from './supabase';
import type { Photo } from '@/types';

const BUCKET_NAME = 'store-visit-photos';

// 画像をアップロード
export async function uploadImage(file: File, visitId: string, index: number): Promise<Photo> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please check your .env file and restart the dev server.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${visitId}-${index}.${fileExt}`;
  const filePath = `${visitId}/${fileName}`;

  // 画像をアップロード
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    id: data.path,
    url: publicUrl,
  };
}

// 画像を削除
export async function deleteImage(photo: Photo): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }
  if (!photo.id) {
    return;
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([photo.id]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// 画像を圧縮
export async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

