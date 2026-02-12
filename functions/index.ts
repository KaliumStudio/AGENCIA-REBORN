import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

admin.initializeApp();

const db = admin.firestore();
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

/**
 * Trigger que se activa al crear un nuevo mensaje en cualquier chat.
 * Envía notificaciones Push y Emails a los miembros del chat (excluyendo al remitente).
 */
export const onNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { chatId } = context.params;

    if (!message) return;

    // Obtener miembros del chat excluyendo al remitente
    const recipientsUids = message.memberUids.filter((uid: string) => uid !== message.senderUid);

    for (const uid of recipientsUids) {
      const userSnap = await db.collection('users').doc(uid).get();
      const userData = userSnap.data();

      if (!userData) continue;

      // 1. Enviar Notificación Push
      if (userData.notificationPrefs?.push && userData.fcmTokens) {
        const tokens = Object.keys(userData.fcmTokens);
        if (tokens.length > 0) {
          const payload = {
            notification: {
              title: `Nuevo mensaje de ${message.senderAlias}`,
              body: message.text.substring(0, 100) + (message.text.length > 100 ? '...' : ''),
            },
            data: {
              chatId: chatId,
              click_action: `https://${process.env.PROJECT_ID}.web.app/chat/${chatId}`
            }
          };
          await admin.messaging().sendToDevice(tokens, payload);
        }
      }

      // 2. Enviar Email
      if (userData.notificationPrefs?.email && userData.email) {
        const msg = {
          to: userData.email,
          from: 'notifications@creativeflow.agency',
          subject: `Nuevo mensaje en la tanda: ${chatId}`,
          html: `
            <p>Hola ${userData.displayName},</p>
            <p>Has recibido un nuevo mensaje de <strong>${message.senderAlias}</strong>:</p>
            <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">
              ${message.text}
            </blockquote>
            <p><a href="https://${process.env.PROJECT_ID}.web.app/chat/${chatId}" style="background: #2962FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir al Chat</a></p>
          `,
        };
        await sgMail.send(msg).catch(console.error);
      }
    }
  });
