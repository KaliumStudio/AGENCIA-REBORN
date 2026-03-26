# Firebase project export for Antigravity

This document provides a consolidated view of the Firebase project state, including configuration, Firestore schema, rules, and Cloud Functions.

## 🛠️ Project Configuration

- **Project ID**: `studio-7837102107-41ca8`
- **Region**: Default (based on `.firebaserc`)
- **App Name**: CreativeFlow

## 📄 Firestore Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ultra-permissive rules for private development environment
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🏗️ Firestore Schema (Entities)

### User
Represents a user in the AM Agency Portal with roles (admin, editor, client).
- **Collection**: `/users/{userId}`
- **Key Fields**: `role`, `displayName`, `active`, `clientId`, `editorDetails`.

### Client
Represents an agency client.
- **Collection**: `/clients/{clientId}`
- **Key Fields**: `name`, `contact`, `creativeQuota`, `imageQuota`, `active`, `createdAt`.

### Batch
Represents creative requests submitted by a client.
- **Collection**: `/batches/{batchId}`
- **Key Fields**: `clientId`, `title`, `productName`, `creativeCount`, `videoSpecs[]`, `status`, `assignedEditorUids[]`.

### LandingRequest
Represents requests for custom landing page development.
- **Collection**: `/landing-requests/{requestId}`
- **Key Fields**: `clientId`, `platform`, `productName`, `bundles`, `driveLink`, `deadline`, `status`.

## ⚡ Cloud Functions

### `onNewMessage`
- **Trigger**: `onCreate` on `chats/{chatId}/messages/{messageId}`
- **Logic**: Sends Push notifications (FCM) and Emails (SendGrid) to chat members (excluding sender).
- **Notifications**:
  - **Push**: Uses `admin.messaging().sendToDevice()`.
  - **Email**: Uses `@sendgrid/mail` with API Key from environment.

## 🤖 AI Configuration (Genkit)

- **Model**: `googleai/gemini-2.0-flash`
- **Plugins**: `googleAI()`
- **Initialization**: `src/ai/genkit.ts`

## 💬 Real-time Chat & Anonymity

- Chat is implemented using Firestore collections (`chats/{chatId}/messages`).
- Alias generation logic ensures client anonymity (Editors as 'Editor #XXXX').
