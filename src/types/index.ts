export type UserRole = 'admin' | 'editor' | 'client';

export interface UserProfile {
  uid: string;
  role: UserRole;
  displayName: string;
  clientId?: string;
  active: boolean;
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

export interface Batch {
  id: string;
  clientId: string;
  clientUserUid: string;
  title: string;
  brief: string;
  dueDate: string;
  status: BatchStatus;
  assignedEditorUids: string[];
  driveLink?: string;
  createdAt: any;
  createdBy: string;
  deliveredAt?: any;
  deliveredBy?: string;
}

export interface Chat {
  id: string;
  batchId: string;
  clientId: string;
  clientUserUid: string;
  memberUids: string[];
  editorAliases: Record<string, string>;
  lastMessageAt: any;
}

export type MessageType = 'text' | 'drive_link' | 'revision_request' | 'system';

export interface Message {
  id: string;
  chatId: string;
  senderUid: string;
  senderRole: UserRole;
  senderAlias: string;
  type: MessageType;
  text: string;
  createdAt: any;
  memberUids: string[];
  clientId?: string; // Denormalización para reglas de seguridad
}