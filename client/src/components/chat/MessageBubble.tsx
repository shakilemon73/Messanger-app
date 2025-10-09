import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { formatMessageTime, getFileIcon, isImageFile } from '@/lib/utils';
import { MoreHorizontal, Download, Reply, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Message } from '@shared/schema';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const { user } = useAuth();
  const { addReaction, deleteMessage } = useChat();
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = (emoji: string) => {
    addReaction(message.id, emoji);
    setShowReactions(false);
  };

  const handleDelete = () => {
    deleteMessage(message.id);
  };

  const handleDownload = () => {
    if (message.fileUrl) {
      window.open(message.fileUrl, '_blank');
    }
  };

  const reactions = Object.entries(message.reactions || {});
  const hasText = message.text && message.text.trim().length > 0;
  const hasFile = message.fileUrl;

  return (
    <div 
      className={`flex items-start gap-3 animate-slide-in ${
        isOwn ? 'flex-row-reverse' : ''
      }`}
      data-testid={`message-bubble-${message.id}`}
    >
      {/* Avatar */}
      {!isOwn && (
        <Avatar
          name={message.senderId} 
          className="w-8 h-8 flex-shrink-0"
          data-testid={`avatar-${message.senderId}`}
        />
      )}
      
      {isOwn && (
        <Avatar
          name={user?.displayName || 'You'}
          className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-primary to-accent text-primary-foreground"
          data-testid="avatar-own"
        />
      )}

      <div className={`flex flex-col gap-1 max-w-md ${isOwn ? 'items-end' : ''}`}>
        <div className="relative group">
          {/* Message Content */}
          <div 
            className={`rounded-2xl shadow-sm ${
              isOwn 
                ? 'message-bubble-sent rounded-tr-sm text-white' 
                : 'message-bubble-received rounded-tl-sm bg-card'
            } ${hasFile && !hasText ? 'p-1' : 'px-4 py-2.5'}`}
          >
            {/* File Content */}
            {hasFile && (
              <div className="mb-2">
                {isImageFile(message.fileName || '') ? (
                  <img 
                    src={message.fileUrl} 
                    alt={message.fileName}
                    className="max-w-xs rounded-lg cursor-pointer hover:brightness-110 transition-all"
                    onClick={() => window.open(message.fileUrl, '_blank')}
                    data-testid="message-image"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-background/20 rounded-lg min-w-[200px]">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <i className={`${getFileIcon(message.fileName || '')} text-primary`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {message.fileName}
                      </p>
                      <p className="text-xs opacity-70">
                        {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="flex-shrink-0"
                      data-testid="button-download-file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Text Content */}
            {hasText && (
              <p className="text-sm" data-testid="message-text">
                {message.text}
              </p>
            )}
          </div>

          {/* Message Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  data-testid="button-message-actions"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setShowReactions(!showReactions)}
                  data-testid="button-add-reaction"
                >
                  <span className="mr-2">😊</span>
                  Add Reaction
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="button-reply">
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                {isOwn && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive"
                    data-testid="button-delete-message"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reaction Pills */}
          {reactions.length > 0 && (
            <div className="absolute -bottom-2 right-3 flex items-center gap-1">
              {reactions.map(([userId, emoji]) => (
                <div 
                  key={userId}
                  className="bg-card border border-border rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm"
                  data-testid={`reaction-${userId}-${emoji}`}
                >
                  <span className="text-xs">{emoji}</span>
                  <span className="text-xs font-medium">1</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Reactions */}
        {showReactions && (
          <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-lg animate-slide-up">
            {['👍', '❤️', '😂', '😢', '😮', '😡'].map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={() => handleReaction(emoji)}
                data-testid={`reaction-button-${emoji}`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}

        {/* Message Info */}
        <div className={`flex items-center gap-1 ${isOwn ? 'mr-3' : 'ml-3'}`}>
          <span 
            className="text-xs text-muted-foreground"
            data-testid="message-timestamp"
          >
            {formatMessageTime(message.timestamp)}
          </span>
          {isOwn && (
            <div data-testid="message-status">
              {message.status === 'sent' && (
                <i className="fas fa-check text-xs text-muted-foreground" />
              )}
              {message.status === 'delivered' && (
                <i className="fas fa-check-double text-xs text-muted-foreground" />
              )}
              {message.status === 'read' && (
                <i className="fas fa-check-double text-xs text-primary" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
