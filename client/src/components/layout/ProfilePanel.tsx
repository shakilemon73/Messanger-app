import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { usePresence } from '@/hooks/usePresence';
import { formatTimestamp } from '@/lib/utils';
import { 
  Phone, 
  Video, 
  Bell, 
  BellOff, 
  Download, 
  Ban, 
  Trash2, 
  Settings,
  X
} from 'lucide-react';

interface ProfilePanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ProfilePanel = ({ isOpen = true, onClose }: ProfilePanelProps) => {
  const { user } = useAuth();
  const { activeConversation, messages } = useChat();
  const [isMuted, setIsMuted] = useState(false);

  // Get the other participant in the conversation
  const otherParticipant = activeConversation?.participants.find(p => p !== user?.id);
  const { isOnline, lastSeen } = usePresence(otherParticipant || '');

  // Filter messages with files
  const mediaMessages = messages.filter(m => m.fileUrl && m.fileName);
  const recentMedia = mediaMessages.slice(-6); // Last 6 media files

  if (!activeConversation || !otherParticipant) {
    return null;
  }

  const getStatusText = () => {
    if (isOnline) return 'Active now';
    if (lastSeen) return `Last seen ${formatTimestamp(lastSeen)}`;
    return 'Offline';
  };

  return (
    <aside className={`w-96 bg-card border-l border-border overflow-y-auto scrollbar-thin max-h-screen ${
      isOpen ? 'block' : 'hidden'
    } xl:block`}>
      <div className="p-6">
        {/* Close button for mobile/tablet */}
        {onClose && (
          <div className="flex justify-end mb-4 xl:hidden">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Profile Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <Avatar
              name={otherParticipant}
              className="w-24 h-24"
              size="xl"
            />
            {isOnline && (
              <span className="absolute bottom-2 right-2 w-4 h-4 bg-success border-4 border-card rounded-full" />
            )}
          </div>
          <h2 className="text-xl font-bold mb-1">{otherParticipant}</h2>
          <p className="text-sm text-muted-foreground">{otherParticipant}@example.com</p>
          <p className="text-xs text-muted-foreground mt-1">{getStatusText()}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Button 
            variant="secondary"
            className="flex flex-col items-center gap-1 h-auto py-3"
            data-testid="button-profile-call"
          >
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-xs">Call</span>
          </Button>
          <Button 
            variant="secondary"
            className="flex flex-col items-center gap-1 h-auto py-3"
            data-testid="button-profile-video"
          >
            <Video className="w-4 h-4 text-primary" />
            <span className="text-xs">Video</span>
          </Button>
          <Button 
            variant="secondary"
            className="flex flex-col items-center gap-1 h-auto py-3"
            onClick={() => setIsMuted(!isMuted)}
            data-testid="button-profile-mute"
          >
            {isMuted ? (
              <BellOff className="w-4 h-4 text-primary" />
            ) : (
              <Bell className="w-4 h-4 text-primary" />
            )}
            <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              About
            </h3>
            <p className="text-sm">
              {/* Placeholder bio - in real app this would come from user profile */}
              Product Designer passionate about creating delightful user experiences. 
              Always learning, always creating.
            </p>
          </div>

          {/* Media & Files */}
          {recentMedia.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Media & Files
                </h3>
                <Button 
                  variant="link" 
                  className="text-xs text-primary p-0 h-auto"
                  data-testid="button-view-all-media"
                >
                  View All
                </Button>
              </div>
              
              {/* Media Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {recentMedia.slice(0, 3).map((message, index) => (
                  <div 
                    key={message.id}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:brightness-110 transition-all"
                    data-testid={`media-item-${index}`}
                  >
                    {message.fileUrl && message.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img 
                        src={message.fileUrl}
                        alt={message.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <i className="fas fa-file text-lg text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* File List */}
              <div className="space-y-2">
                {mediaMessages.slice(-3).map((message) => (
                  <div 
                    key={message.id}
                    className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer"
                    data-testid={`file-item-${message.id}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-file text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {message.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB` : ''} • {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(message.fileUrl, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Settings */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Settings
            </h3>
            <div className="space-y-2">
              <Button 
                variant="ghost"
                className="w-full justify-start"
                data-testid="button-notifications"
              >
                <Bell className="w-4 h-4 mr-3" />
                Custom Notifications
              </Button>
              
              <Button 
                variant="ghost"
                className="w-full justify-start"
                data-testid="button-export-chat"
              >
                <Download className="w-4 h-4 mr-3" />
                Export Chat
              </Button>
              
              <Button 
                variant="ghost"
                className="w-full justify-start hover:bg-destructive/20 hover:text-destructive"
                data-testid="button-block-user"
              >
                <Ban className="w-4 h-4 mr-3" />
                Ban User
              </Button>
              
              <Button 
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/20"
                data-testid="button-delete-conversation"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete Conversation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
