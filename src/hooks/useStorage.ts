import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from '../firebase';

export function useStorage() {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    return new Promise((resolve, reject) => {
      // Create a unique file name to avoid overwriting
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `universities/${folder}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (err) => {
          console.error("Lỗi upload ảnh:", err);
          setError("Tải ảnh thất bại. Vui lòng kiểm tra lại kết nối mạng hoặc quyền truy cập.");
          setIsUploading(false);
          reject(err);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setIsUploading(false);
            setUploadProgress(100);
            resolve(downloadURL);
          } catch (err) {
            console.error("Lỗi lấy URL ảnh:", err);
            setError("Tải ảnh thành công nhưng không lấy được link.");
            setIsUploading(false);
            reject(err);
          }
        }
      );
    });
  };

  const fetchGalleryImages = async (folder: string): Promise<string[]> => {
    try {
      const listRef = ref(storage, `universities/${folder}`);
      const res = await listAll(listRef);
      
      // Get URLs for all items in this folder
      const urls = await Promise.all(
        res.items.map(async (itemRef) => {
          return await getDownloadURL(itemRef);
        })
      );
      
      return urls;
    } catch (err) {
      console.error("Lỗi load thư viện ảnh:", err);
      return [];
    }
  };

  return {
    uploadImage,
    fetchGalleryImages,
    uploadProgress,
    isUploading,
    error,
  };
}
