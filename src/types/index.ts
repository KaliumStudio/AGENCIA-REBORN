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
  createdAt: any;
}

export type BatchStatus = 'new' | 'in_progress' | 'delivered' | 'revisions' | 'approved';

export interface Batch {
  id: string;
  clientId: string;
  title: string;
  brief: string;
  dueDate: string;
  status: BatchStatus;
  assignedEditorUids: string[];
  driveLink?: string;
  createdAt: any;
  createdBy: string;
}

export interface Chat {
  id: string;
  batchId: string;
  clientId: string;
  members: Record<string, boolean>;
  editorAliases: Record<string, string>;
  lastMessageAt: any;
}

export type MessageType = 'text' | 'drive_link' | 'revision_request' | 'system';

export interface Message {
  id: string;
  senderUid: string;
  senderRole: UserRole;
  senderAlias: string;
  type: MessageType;
  text: string;
  createdAt: any;
}