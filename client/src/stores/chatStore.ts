import { create } from 'zustand';
import type { Conversation, Message } from '@shared/schema';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  typingUsers: string[];
  uploadProgress: number;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  setTypingUsers: (users: string[]) => void;
  setUploadProgress: (progress: number) => void;
  
  // Computed
  activeConversation: () => Conversation | null;
  unreadCount: (conversationId: string, userId: string) => number;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  typingUsers: [],
  uploadProgress: 0,

  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (id) => set({ 
    activeConversationId: id,
    messages: [], // Clear messages when switching conversations
    typingUsers: []
  }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    )
  })),
  
  removeMessage: (messageId) => set((state) => ({
    messages: state.messages.filter(msg => msg.id !== messageId)
  })),
  
  setTypingUsers: (users) => set({ typingUsers: users }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  // Computed getters
  activeConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find(c => c.id === activeConversationId) || null;
  },
  
  unreadCount: (conversationId, userId) => {
    const { conversations } = get();
    const conversation = conversations.find(c => c.id === conversationId);
    return conversation?.unreadCount[userId] || 0;
  },
}));
