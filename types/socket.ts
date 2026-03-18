export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  products?: any[];
}

export interface UserTypingEvent {
  userId: string;
  isTyping: boolean;
}

export interface SendMessageEvent {
  message: string;
  userId?: string;
  token?: string | null;
}

export interface ReceiveMessageEvent extends ChatMessage {}

export interface ErrorEvent {
  message: string;
  code?: string;
}