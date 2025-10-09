import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/CustomAvatar';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';
import { formatTimestamp } from '@/lib/utils';
import { Phone, Video, Info, Menu } from 'lucide-react';

interface ChatAreaProps {
  onToggleSidebar?: () => void;
  onToggleProfilePanel?: () => void;
}

export const ChatArea = ({ onToggleSidebar, onToggleProfilePanel }: ChatAreaProps) => {
  const { user } = useAuth();
  const { activeConversation, messages, typingUsers, loadingMessages } = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the other participant(s) in the conversation
  const otherParticipants = activeConversation?.participants.filter(p => p !== user?.id) || [];
  const otherParticipantId = otherParticipants[0]; // For now, assuming 1-on-1 conversations
  const { isOnline, lastSeen } = usePresence(otherParticipantId);

  // If no active conversation, show empty state
  if (!activeConversation) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <i className="fas fa-comments text-2xl text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
          <p className="text-muted-foreground">
            Select a conversation to start messaging
          </p>
        </div>
      </main>
    );
  }

  const getStatusText = () => {
    if (typingUsers.length > 0) {
      return <span className="text-primary">typing...</span>;
    }
    
    if (isOnline) {
      return 'Online';
    }
    
    if (lastSeen) {
      return `Last seen ${formatTimestamp(lastSeen)}`;
    }
    
    return 'Offline';
  };

  const getConversationName = () => {
    // For now, return the first other participant's ID
    // In a real app, you'd fetch the user data
    return otherParticipantId || 'Unknown User';
  };

  return (
    <main className="flex-1 flex flex-col bg-background relative max-h-screen lg:h-screen">
      {/* Chat Header */}
      <header className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onToggleSidebar}
            data-testid="button-toggle-sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Avatar 
              name={getConversationName()}
              className="w-10 h-10"
              data-testid="avatar-conversation"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-card rounded-full" />
            )}
          </div>
          
          <div>
            <h2 className="font-semibold" data-testid="text-conversation-name">
              {getConversationName()}
            </h2>
            <p className="text-xs text-muted-foreground" data-testid="text-user-status">
              {getStatusText()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            data-testid="button-voice-call"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid="button-video-call"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggleProfilePanel}
            data-testid="button-toggle-profile"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages Container */}
      <MessageList 
        messages={messages}
        loading={loadingMessages}
        data-testid="message-list"
      />

      {/* Message Input */}
      <MessageInput data-testid="message-input" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
      />
    </main>
  );
};
