import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/CustomAvatar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ConversationList } from './ConversationList';
import { useAuth } from '@/hooks/useAuth';
import { useUserSearch } from '@/hooks/useFirestore';
import { useChat } from '@/hooks/useChat';
import { Search, Edit, Settings } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface SidebarProps {
  onToggle?: () => void;
}

export const Sidebar = ({ onToggle }: SidebarProps) => {
  const { user, logout } = useAuth();
  const { users, search } = useUserSearch();
  const { createConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    if (query.trim()) {
      search(query);
      setShowUserSearch(true);
    } else {
      setShowUserSearch(false);
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleUserSelect = async (userId: string) => {
    try {
      await createConversation([userId]);
      setSearchQuery('');
      setShowUserSearch(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  if (!user) return null;

  return (
    <aside className="w-full lg:w-80 xl:w-96 bg-card border-r border-border flex flex-col max-h-screen lg:h-screen">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              name={user.displayName}
              src={user.photoURL}
              className="w-10 h-10"
              data-testid="avatar-current-user"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-card rounded-full" />
          </div>
          <div>
            <h2 className="font-semibold text-sm" data-testid="text-current-user-name">
              {user.displayName}
            </h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            data-testid="button-new-chat"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <ThemeToggle data-testid="theme-toggle" />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={logout}
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations or users..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Search Results */}
      {showUserSearch && (
        <div className="border-b border-border">
          <div className="p-2 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Users
            </p>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {users.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              users.map(searchUser => (
                <Button
                  key={searchUser.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleUserSelect(searchUser.id)}
                  data-testid={`button-user-${searchUser.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={searchUser.displayName}
                      src={searchUser.photoURL}
                      className="w-8 h-8"
                    />
                    <div className="text-left">
                      <p className="font-medium text-sm">{searchUser.displayName}</p>
                      <p className="text-xs text-muted-foreground">{searchUser.email}</p>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Conversation List */}
      <ConversationList data-testid="conversation-list" />
    </aside>
  );
};
