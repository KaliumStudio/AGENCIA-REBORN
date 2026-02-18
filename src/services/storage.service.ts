import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
  /**
   * Sube un archivo a Firebase Storage y retorna la URL de descarga.
   * @param file El archivo a subir
   * @param path El directorio de destino (ej: 'chats/chatId')
   */
  async uploadFile(file: File, path: string): Promise<{ url: string; name: string; size: number; type: string }> {
    console.log("storageService: Iniciando subida...", { name: file.name, size: file.size, path });
    
    try {
      // Generar un ID único simple
      const fileId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const extension = file.name.split('.').pop();
      const fileName = `${fileId}.${extension}`;
      
      const storageRef = ref(storage, `${path}/${fileName}`);
      console.log("storageService: Referencia creada en", storageRef.fullPath);

      // Realizar la subida
      const snapshot = await uploadBytes(storageRef, file);
      console.log("storageService: Subida completada con éxito");
      
      const url = await getDownloadURL(snapshot.ref);
      console.log("storageService: URL de descarga obtenida:", url);

      return {
        url,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error: any) {
      console.error("storageService: Error fatal en uploadFile:", error);
      throw error;
    }
  }
};
