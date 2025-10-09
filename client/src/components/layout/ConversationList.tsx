import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/CustomAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useMultiplePresence } from '@/hooks/usePresence';
import { formatTimestamp, compressText } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import type { Conversation } from '@shared/schema';

export const ConversationList = () => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    loadingConversations,
  } = useChat();

  // Get all participant IDs for presence tracking
  const allParticipantIds = conversations.flatMap(conv => 
    conv.participants.filter(id => id !== user?.id)
  );
  const presenceMap = useMultiplePresence(allParticipantIds);

  if (loadingConversations) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 p-3">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <i className="fas fa-comments text-xl text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No conversations</h3>
          <p className="text-muted-foreground text-sm">
            Search for users to start a conversation
          </p>
        </div>
      </div>
    );
  }

  const getConversationName = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(id => id !== user?.id);
    return otherParticipant || 'Unknown User';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(id => id !== user?.id);
    return otherParticipant;
  };

  const isOnline = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(id => id !== user?.id);
    return otherParticipant ? presenceMap[otherParticipant]?.isOnline : false;
  };

  const getUnreadCount = (conversation: Conversation) => {
    if (!user) return 0;
    return conversation.unreadCount[user.id] || 0;
  };

  const formatLastMessage = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const maxLength = 40;
    return compressText(conversation.lastMessage, maxLength);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId;
        const unreadCount = getUnreadCount(conversation);
        const online = isOnline(conversation);

        return (
          <Button
            key={conversation.id}
            variant="ghost"
            className={`w-full justify-start h-auto p-4 hover:bg-accent/50 border-l-4 transition-all ${
              isActive 
                ? 'border-primary bg-accent/30' 
                : 'border-transparent'
            }`}
            onClick={() => setActiveConversation(conversation.id)}
            data-testid={`conversation-${conversation.id}`}
          >
            <div className="flex gap-3 w-full">
              <div className="relative flex-shrink-0">
                <Avatar
                  name={getConversationName(conversation)}
                  className="w-12 h-12"
                  data-testid={`avatar-${conversation.id}`}
                />
                {online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-card rounded-full" />
                )}
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 
                    className={`font-semibold text-sm truncate ${
                      unreadCount > 0 ? 'text-foreground' : 'text-foreground'
                    }`}
                    data-testid={`conversation-name-${conversation.id}`}
                  >
                    {getConversationName(conversation)}
                  </h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {conversation.lastMessageTime 
                      ? formatTimestamp(conversation.lastMessageTime) 
                      : ''}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 min-w-0">
                    {/* Message status indicator for sent messages */}
                    <CheckCheck className="w-3 h-3 text-primary flex-shrink-0" />
                    <p 
                      className="text-sm text-muted-foreground truncate"
                      data-testid={`last-message-${conversation.id}`}
                    >
                      {formatLastMessage(conversation)}
                    </p>
                  </div>
                  
                  {unreadCount > 0 && (
                    <span 
                      className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2"
                      data-testid={`unread-count-${conversation.id}`}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
