import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export function useStorage() {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadCount, setUploadCount] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    return new Promise((resolve, reject) => {
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

  // Upload nhiều file hàng loạt
  const uploadImages = async (
    files: File[],
    folder: string,
    onProgress?: (done: number, total: number) => void
  ): Promise<string[]> => {
    setIsUploading(true);
    setError(null);
    setUploadCount({ done: 0, total: files.length });
    const results: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const fileName = `${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `universities/${folder}/${fileName}`);
        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, file);
          task.on('state_changed', null,
            (err) => reject(err),
            async () => {
              const url = await getDownloadURL(task.snapshot.ref);
              results.push(url);
              resolve();
            }
          );
        });
      } catch (e) {
        console.error(`Lỗi upload file ${file.name}:`, e);
      }
      const done = i + 1;
      setUploadCount({ done, total: files.length });
      setUploadProgress((done / files.length) * 100);
      onProgress?.(done, files.length);
    }

    setIsUploading(false);
    return results;
  };

  const fetchGalleryImages = async (folder: string): Promise<string[]> => {
    try {
      const listRef = ref(storage, `universities/${folder}`);
      const res = await listAll(listRef);
      const urls = await Promise.all(res.items.map((itemRef) => getDownloadURL(itemRef)));
      return urls;
    } catch (err) {
      console.error("Lỗi load thư viện ảnh:", err);
      return [];
    }
  };

  // Xóa ảnh khỏi Firebase Storage theo download URL
  const deleteImage = async (url: string): Promise<void> => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const match = decodedUrl.match(/\/o\/(.+?)\?/);
      if (!match) throw new Error('Không thể xác định path ảnh từ URL');
      const path = match[1];
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (err) {
      console.error("Lỗi xóa ảnh:", err);
      throw err;
    }
  };

  return {
    uploadImage,
    uploadImages,
    fetchGalleryImages,
    deleteImage,
    uploadProgress,
    uploadCount,
    isUploading,
    error,
  };
}
