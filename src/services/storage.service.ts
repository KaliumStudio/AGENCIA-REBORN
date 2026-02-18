import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
  /**
   * Sube un archivo a Firebase Storage y retorna la URL de descarga.
   * @param file El archivo a subir
   * @param path El directorio de destino (ej: 'chats/chatId/files')
   */
  async uploadFile(file: File, path: string): Promise<{ url: string; name: string; size: number; type: string }> {
    const fileId = crypto.randomUUID();
    const extension = file.name.split('.').pop();
    const fileName = `${fileId}.${extension}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      name: file.name,
      size: file.size,
      type: file.type
    };
  }
};
