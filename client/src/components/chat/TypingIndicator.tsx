import { Avatar } from '@/components/ui/CustomAvatar';
import { useUser } from '@/hooks/useFirestore';

interface TypingIndicatorProps {
  userIds: string[];
}

export const TypingIndicator = ({ userIds }: TypingIndicatorProps) => {
  if (userIds.length === 0) return null;

  // For now, just show the first user typing
  const userId = userIds[0];

  return (
    <div className="flex items-start gap-3 animate-slide-in">
      <Avatar 
        name={userId} 
        className="w-8 h-8 flex-shrink-0"
        data-testid={`avatar-typing-${userId}`}
      />
      <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <div 
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};
