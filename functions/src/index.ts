/**
 * Cloud Functions (Gen2) for CreativeFlow
 * - ping: quick health check
 * - notifyOnMessageCreate: fires when a new chat message is created
 */

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

// 1) Health check (para confirmar deploy + logs)
export const ping = onRequest((req, res) => {
  logger.info("PING", {
    method: req.method,
    path: req.path,
  });
  res.status(200).send("pong");
});

// 2) Trigger: cuando se crea un mensaje en un chat
export const notifyOnMessageCreate = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const message = snap.data();
    const { chatId } = event.params;

    if (!message) return;

    const {
      senderUid,
      memberUids,
      senderAlias,
      text,
      clientId,
    } = message;

    // Basic validation
    if (!memberUids || !Array.isArray(memberUids)) {
      logger.warn("Message document missing memberUids array", { chatId });
      return;
    }

    // Identify recipients (exclude sender)
    const recipientUids = memberUids.filter((uid: string) => uid !== senderUid);
    if (recipientUids.length === 0) {
      logger.info("No other recipients in this chat", { chatId, senderUid });
      return;
    }

    // Collect all tokens for all recipients
    const allTokens: string[] = [];
    const uidToTokensMap: Record<string, string[]> = {};

    for (const uid of recipientUids) {
      const userRef = db.collection("users").doc(uid);
      const userSnap = await userRef.get();
      
      if (!userSnap.exists) continue;

      const userData = userSnap.data() || {};
      
      // Check notification preferences (default to true if not set)
      if (userData.notificationPrefs?.push === false) {
        logger.info(`User ${uid} has push disabled`);
        continue;
      }

      const userTokens: string[] = [];

      // A. Check Map format: users/{uid}.fcmTokens = { "TOKEN": true }
      if (userData.fcmTokens && typeof userData.fcmTokens === 'object' && !Array.isArray(userData.fcmTokens)) {
        userTokens.push(...Object.keys(userData.fcmTokens));
      } 
      // B. Check Array format: users/{uid}.fcmTokens = ["TOKEN1", "TOKEN2"]
      else if (Array.isArray(userData.fcmTokens)) {
        userTokens.push(...userData.fcmTokens);
      }

      // C. Check Subcollection format: users/{uid}/fcmTokens/{docId} { token: "..." }
      try {
        const subColTokens = await userRef.collection("fcmTokens").get();
        subColTokens.forEach(doc => {
          const t = doc.data().token;
          if (t && !userTokens.includes(t)) userTokens.push(t);
        });
      } catch (err) {
        // Subcollection might not exist, ignore
      }

      if (userTokens.length > 0) {
        const uniqueTokens = Array.from(new Set(userTokens));
        allTokens.push(...uniqueTokens);
        uidToTokensMap[uid] = uniqueTokens;
      }
    }

    if (allTokens.length === 0) {
      logger.info("No valid FCM tokens found for recipients", { recipientUids });
      return;
    }

    // Prepare the multicast message payload
    const messagePayload: MulticastMessage = {
      tokens: allTokens,
      notification: {
        title: "Nuevo mensaje",
        body: `${senderAlias}: ${text.slice(0, 120)}${text.length > 120 ? '...' : ''}`,
      },
      data: {
        chatId,
        clientId: clientId || "",
        senderUid: senderUid || "",
      },
      webpush: {
        fcmOptions: {
          link: `/client/batches/${chatId}/chat`,
        },
      },
    };

    try {
      const response = await messaging.sendEachForMulticast(messagePayload);
      logger.info("FCM multcast send completed", {
        successCount: response.successCount,
        failureCount: response.failureCount,
      });

      // Cleanup invalid tokens if any
      if (response.failureCount > 0) {
        const cleanupPromises: Promise<any>[] = [];
        
        response.responses.forEach((res, index) => {
          if (!res.success && res.error) {
            const errorCode = res.error.code;
            if (
              errorCode === "messaging/registration-token-not-registered" ||
              errorCode === "messaging/invalid-registration-token"
            ) {
              const invalidToken = allTokens[index];
              // Identify the user who owns this invalid token to clean it up from their profile
              for (const [uid, tokens] of Object.entries(uidToTokensMap)) {
                if (tokens.includes(invalidToken)) {
                  cleanupPromises.push(
                    db.collection("users").doc(uid).update({
                      [`fcmTokens.${invalidToken}`]: FieldValue.delete()
                    }).catch(e => logger.error(`Error removing token ${invalidToken} for user ${uid}`, e))
                  );
                  break;
                }
              }
            }
          }
        });

        if (cleanupPromises.length > 0) {
          await Promise.all(cleanupPromises);
          logger.info(`Cleaned up ${cleanupPromises.length} invalid tokens`);
        }
      }
    } catch (err) {
      logger.error("Failed to send FCM multicast message", err);
    }
  }
);
