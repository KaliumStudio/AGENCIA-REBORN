# **App Name**: CreativeFlow

## Core Features:

- User Authentication and Roles: Secure login system with different roles (admin, editor, client) using Firebase Authentication.
- Batch Management: Clients can create, view, and manage batches of creative requests. Admins can assign editors, and track status. Editors can provide Drive links to the batches
- Real-time Chat with Anonymity: Implement a real-time chat feature using Firestore, ensuring client anonymity by displaying editors as 'Editor #XXXX'.
- Drive Link Submission: Editors can submit Google Drive links for completed batches, triggering a system message in the chat and updating the batch status to 'delivered'.
- Revision Request: Clients can request revisions, which sends a message to the chat.
- Alias Generator Tool: Automatically generates unique anonymous aliases for editors (Editor #XXXX) within each chat, storing them in Firestore to ensure persistent anonymity using a Cloud Function.
- Notifications for Unread Messages: Display a badge indicating unread messages for each batch, ensuring timely communication.

## Style Guidelines:

- Primary color: Deep blue (#2962FF) to convey trust, professionalism, and creativity. 
- Background color: Light blue (#E6EDFF), a desaturated variant of the primary, providing a clean and professional backdrop.
- Accent color: Violet (#7A3EF5) to create contrast and draw attention to interactive elements, complementing the overall palette with a creative spark.
- Body and headline font: 'Inter', a sans-serif font, for a modern, neutral, professional, and readable feel.
- Use minimalist, consistent icons for statuses, actions, and navigation.
- Maintain a clean, modular layout with clear separation of concerns between UI elements, business logic, and data access.
- Implement subtle animations for state transitions and feedback, enhancing the user experience without being distracting.