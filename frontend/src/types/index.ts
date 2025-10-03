export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  labels?: string;
  assignee: User;
  assigneeId: string;
  createdBy: User;
  createdById: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  taskId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  channel: string;
  user: User;
  userId: string;
  attachments: Attachment[];
  reactions: Reaction[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  messageId: string;
}

export interface Notification {
  id: string;
  type: 'task_assigned' | 'task_due' | 'mention' | 'message';
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
}
