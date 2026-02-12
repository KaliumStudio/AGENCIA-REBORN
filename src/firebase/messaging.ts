
import { getMessaging, isSupported } from 'firebase/messaging';
import { app } from '@/lib/firebase';

/**
 * Initializes Firebase Messaging only on the client side and if supported by the browser.
 */
export const getFcmMessaging = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('FCM is not supported in this browser environment.');
      return null;
    }
    return getMessaging(app);
  } catch (error) {
    console.error('Error initializing FCM:', error);
    return null;
  }
};
