import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getToken, getMessaging } from 'firebase/messaging';

export const notificationService = {
  async requestPermission(uid: string) {
    try {
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY // Requiere configurar VAPID Key en Firebase
      });

      if (token) {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          [`fcmTokens.${token}`]: true,
          'notificationPrefs.push': true
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al solicitar permiso de notificación:', error);
      return false;
    }
  },

  async updatePrefs(uid: string, prefs: { email?: boolean; push?: boolean }) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      notificationPrefs: prefs
    });
  }
};
