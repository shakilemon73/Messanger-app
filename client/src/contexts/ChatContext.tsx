import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { 
  subscribeToUserConversations, 
  subscribeToMessages, 
  subscribeToTypingIndicators 
} from '@/lib/firestore';
import type { Conversation, Message, User } from '@shared/schema';

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  typingUsers: string[];
  setActiveConversation: (conversationId: string | null) => void;
  loadingConversations: boolean;
  loadingMessages: boolean;
}

const ChatContext = createContext<ChatContextType>({
  conversations: [],
  activeConversationId: null,
  messages: [],
  typingUsers: [],
  setActiveConversation: () => {},
  loadingConversations: true,
  loadingMessages: false,
});

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Subscribe to conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    const unsubscribe = subscribeToUserConversations(user.id, (conversations) => {
      setConversations(conversations);
      setLoadingConversations(false);
      
      // Auto-select first conversation if none selected
      if (!activeConversationId && conversations.length > 0) {
        setActiveConversationId(conversations[0].id);
      }
    });

    return unsubscribe;
  }, [user]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const unsubscribe = subscribeToMessages(activeConversationId, (messages) => {
      setMessages(messages);
      setLoadingMessages(false);
    });

    return unsubscribe;
  }, [activeConversationId]);

  // Subscribe to typing indicators for active conversation
  useEffect(() => {
    if (!activeConversationId || !user) {
      setTypingUsers([]);
      return;
    }

    const unsubscribe = subscribeToTypingIndicators(activeConversationId, (typingUsers) => {
      // Filter out current user
      const otherTypingUsers = typingUsers.filter(userId => userId !== user.id);
      setTypingUsers(otherTypingUsers);
    });

    return unsubscribe;
  }, [activeConversationId, user]);

  const setActiveConversation = (conversationId: string | null) => {
    setActiveConversationId(conversationId);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      messages,
      typingUsers,
      setActiveConversation,
      loadingConversations,
      loadingMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
