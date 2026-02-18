export type UserRole = 'admin' | 'editor' | 'client';

export interface UserProfile {
  uid: string;
  role: UserRole;
  displayName: string;
  clientId?: string;
  active: boolean;
  fcmTokens?: Record<string, boolean> | string[];
  notificationPrefs?: {
    email: boolean;
    push: boolean;
  };
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  contactEmail?: string;
  active: boolean;
  createdAt: any;
  createdBy: string;
}

export type BatchStatus = 'new' | 'in_progress' | 'delivered' | 'revisions' | 'approved';

export interface VideoSpecification {
  script?: string;
  notes?: string;
  format?: 'UGC IA' | 'CINEMATICO' | 'POV' | 'PODCAST';
}

export interface Batch {
  id: string;
  clientId: string;
  clientUserUid: string;
  title: string;
  productName: string;
  creativeCount: number;
  videoSpecs: VideoSpecification[];
  referenceLinks: string;
  landingPage: string;
  additionalNotes?: string;
  deliveryDeadlineTime: string;
  status: BatchStatus;
  assignedEditorUids: string[];
  driveLink?: string;
  createdAt: any;
  createdBy: string;
  deliveredAt?: any;
  deliveredBy?: string;
  // Deprecated fields kept for backward compatibility if necessary
  brief?: string;
  dueDate?: string;
}

export interface Chat {
  id: string;
  batchId: string;
  clientId: string;
  clientUserUid: string;
  memberUids: string[];
  editorAliases: Record<string, string>;
  lastMessageAt: any;
  lastReadAtByUid: Record<string, any>;
}

export type MessageType = 'text' | 'image' | 'file' | 'drive_link' | 'revision_request' | 'system';

export interface Message {
  id: string;
  chatId: string;
  senderUid: string;
  senderRole: UserRole;
  senderAlias: string;
  type: MessageType;
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: any;
  memberUids: string[];
  clientId?: string;
}
