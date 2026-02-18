import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
  /**
   * Sube un archivo a Firebase Storage y devuelve la URL de descarga y metadatos.
   * @param file El archivo a subir
   * @param path La ruta en el storage (ej: 'chats/chatId')
   */
  async uploadFile(file: File, path: string): Promise<{ url: string; name: string; size: number; type: string }> {
    console.log("StorageService: Iniciando subida de archivo...", { name: file.name, size: file.size, type: file.type });
    
    try {
      // Crear un nombre único para el archivo
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000000);
      const extension = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomSuffix}.${extension}`;
      
      const fullPath = `${path}/${fileName}`;
      const storageRef = ref(storage, fullPath);
      
      // Realizar la subida
      // Nota: Si persiste el error storage/unknown, es probable que se deba a la falta de configuración de CORS en el bucket.
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type // Es importante especificar el tipo de contenido
      });
      
      console.log("StorageService: Subida completada con éxito.");
      
      const url = await getDownloadURL(snapshot.ref);
      
      return {
        url,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error: any) {
      console.error("StorageService: Error detallado en la subida:", error);
      // Re-lanzamos el error para que sea capturado por el componente
      throw error;
    }
  }
};
