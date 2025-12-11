export interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'text';
  mimeType: string;
  data: string; // Base64 encoded data
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}