
import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging, MulticastMessage } from "firebase-admin/messaging";

// Initialize Admin SDK once
initializeApp();
const db = getFirestore();
const messaging = getMessaging();

setGlobalOptions({ maxInstances: 10 });

export const ping = onRequest((req, res) => {
  res.status(200).send("pong");
});

export const notifyOnMessageCreate = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const message = snap.data();
    const { chatId } = event.params;

    if (!message) return;

    const { senderUid, memberUids, senderAlias, text, clientId } = message;

    if (!memberUids || !Array.isArray(memberUids)) {
      logger.warn("Missing memberUids in message", { chatId });
      return;
    }

    const recipientUids = memberUids.filter((uid: string) => uid !== senderUid);
    if (recipientUids.length === 0) return;

    const allTokens: string[] = [];
    const uidToTokensMap: Record<string, string[]> = {};

    for (const uid of recipientUids) {
      const userRef = db.collection("users").doc(uid);
      const userSnap = await userRef.get();
      if (!userSnap.exists) continue;

      const userData = userSnap.data() || {};
      if (userData.notificationPrefs?.push === false) continue;

      const userTokens: string[] = [];

      // Soporte para ambos formatos: Mapa y Array
      if (userData.fcmTokens && typeof userData.fcmTokens === 'object' && !Array.isArray(userData.fcmTokens)) {
        userTokens.push(...Object.keys(userData.fcmTokens));
      } else if (Array.isArray(userData.fcmTokens)) {
        userTokens.push(...userData.fcmTokens);
      }

      if (userTokens.length > 0) {
        const uniqueTokens = Array.from(new Set(userTokens));
        allTokens.push(...uniqueTokens);
        uidToTokensMap[uid] = uniqueTokens;
      }
    }

    if (allTokens.length === 0) {
      logger.info("No tokens found for recipients");
      return;
    }

    // Configuración para WebPush (Desktop y Mobile)
    const messagePayload: MulticastMessage = {
      tokens: allTokens,
      notification: {
        title: "Nuevo mensaje",
        body: `${senderAlias}: ${text.slice(0, 120)}${text.length > 120 ? '...' : ''}`,
      },
      data: {
        chatId,
        clientId: clientId || "",
      },
      webpush: {
        headers: {
          Urgency: "high",
        },
        notification: {
          title: "Nuevo mensaje",
          body: `${senderAlias}: ${text.slice(0, 120)}${text.length > 120 ? '...' : ''}`,
          icon: "/icons/icon-192x192.png",
          tag: chatId, // Colapsa notificaciones del mismo chat
          renotify: true,
        },
        fcmOptions: {
          link: `/client/batches/${chatId}/chat`,
        },
      },
    };

    try {
      const response = await messaging.sendEachForMulticast(messagePayload);
      logger.info("FCM Sent", { success: response.successCount, failure: response.failureCount });

      // Limpieza de tokens inválidos
      if (response.failureCount > 0) {
        const cleanupPromises: Promise<any>[] = [];
        response.responses.forEach((res, index) => {
          if (!res.success && res.error) {
            const errorCode = res.error.code;
            if (errorCode === "messaging/registration-token-not-registered" || errorCode === "messaging/invalid-registration-token") {
              const invalidToken = allTokens[index];
              for (const [uid, tokens] of Object.entries(uidToTokensMap)) {
                if (tokens.includes(invalidToken)) {
                  cleanupPromises.push(db.collection("users").doc(uid).update({
                    fcmTokens: FieldValue.arrayRemove(invalidToken),
                    [`fcmTokens.${invalidToken}`]: FieldValue.delete()
                  }).catch(() => {}));
                  break;
                }
              }
            }
          }
        });
        await Promise.all(cleanupPromises);
      }
    } catch (err) {
      logger.error("FCM failed", err);
    }
  }
);
