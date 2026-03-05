
export type UserRole = 'admin' | 'editor' | 'client';

export interface EditorDetails {
  dailyCapacity: number;
  workingDays: string[];
  specializedFormats: string[];
  payPerCreative: number;
  paymentContract: 'pago fijo' | 'pago por creativos acumulados';
  paymentPeriod: 'quincenal' | 'mensual' | 'express';
}

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
  editorDetails?: EditorDetails;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  contactEmail?: string;
  creativeQuota?: number;
  active: boolean;
  createdAt: any;
  createdBy: string;
}

export type BatchStatus = 'new' | 'in_progress' | 'delivered' | 'revisions' | 'approved';

export interface VideoSpecification {
  script?: string;
  notes?: string;
  format?: 'UGC IA' | 'CINEMATICO' | 'POV' | 'PODCAST' | 'IMAGEN' | 'TRADUCCIÓN SIMPLE' | 'UGC IA + CINEMATICO';
}

export interface EditHistoryEntry {
  uid: string;
  userName: string;
  timestamp: any;
  action: string;
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
  editHistory?: EditHistoryEntry[];
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
  senderName?: string;
  type: MessageType;
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: any;
  memberUids: string[];
  clientId?: string;
}
