import { useState } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  sendMessage, 
  createConversation, 
  findExistingConversation,
  addMessageReaction,
  removeMessageReaction,
  deleteMessage,
  setTypingIndicator
} from '@/lib/firestore';
import { uploadFile } from '@/lib/storage';
import { useToast } from './use-toast';
import { debounce } from '@/lib/utils';
import type { InsertMessage } from '@shared/schema';

export const useChat = () => {
  const { user } = useAuthContext();
  const { 
    conversations, 
    activeConversationId, 
    messages, 
    typingUsers, 
    setActiveConversation,
    loadingConversations,
    loadingMessages
  } = useChatContext();
  const { toast } = useToast();
  
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSendMessage = async (text?: string, file?: File) => {
    if (!user || !activeConversationId || (!text?.trim() && !file)) return;

    try {
      setSendingMessage(true);
      let fileUrl, fileName, fileSize, fileType;

      // Upload file if provided
      if (file) {
        const uploadResult = await uploadFile(
          file, 
          `conversations/${activeConversationId}`,
          setUploadProgress
        );
        fileUrl = uploadResult.downloadURL;
        fileName = uploadResult.fileName;
        fileSize = uploadResult.fileSize;
        fileType = file.type;
      }

      const messageData: InsertMessage = {
        conversationId: activeConversationId,
        senderId: user.id,
        text: text?.trim() || undefined,
        fileUrl,
        fileName,
        fileSize,
        fileType,
        status: 'sent',
        reactions: {},
      };

      await sendMessage(messageData);
      
      toast({
        title: 'Message sent',
        description: file ? 'File uploaded successfully' : 'Your message has been delivered',
      });

    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
      setUploadProgress(0);
    }
  };

  const handleCreateConversation = async (participantIds: string[]): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const allParticipants = [user.id, ...participantIds];
    
    // Check if conversation already exists
    const existingId = await findExistingConversation(allParticipants);
    if (existingId) {
      setActiveConversation(existingId);
      return existingId;
    }

    // Create new conversation
    const conversationId = await createConversation(allParticipants);
    setActiveConversation(conversationId);
    return conversationId;
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this emoji
      const message = messages.find(m => m.id === messageId);
      if (message?.reactions[user.id] === emoji) {
        await removeMessageReaction(messageId, user.id);
      } else {
        await addMessageReaction(messageId, user.id, emoji);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to add reaction',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast({
        title: 'Message deleted',
        description: 'The message has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to delete message',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Debounced typing indicator
  const handleTyping = debounce(() => {
    if (user && activeConversationId) {
      setTypingIndicator(activeConversationId, user.id, false);
    }
  }, 3000);

  const handleStartTyping = () => {
    if (user && activeConversationId) {
      setTypingIndicator(activeConversationId, user.id, true);
      handleTyping(); // This will stop typing after 3 seconds
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    typingUsers,
    sendingMessage,
    uploadProgress,
    loadingConversations,
    loadingMessages,
    setActiveConversation,
    sendMessage: handleSendMessage,
    createConversation: handleCreateConversation,
    addReaction: handleReaction,
    deleteMessage: handleDeleteMessage,
    startTyping: handleStartTyping,
  };
};
