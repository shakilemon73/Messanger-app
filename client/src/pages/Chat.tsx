import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ProfilePanel } from '@/components/layout/ProfilePanel';
import { useChat } from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Chat() {
  const { id } = useParams();
  const { setActiveConversation } = useChat();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  // Set active conversation if ID is provided
  useEffect(() => {
    if (id) {
      setActiveConversation(id);
    }
  }, [id, setActiveConversation]);

  // Handle mobile responsive behavior
  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleProfilePanel = () => {
    setShowProfilePanel(!showProfilePanel);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Sidebar */}
      <div className={`${
        showSidebar ? 'block' : 'hidden'
      } ${isMobile ? 'fixed inset-0 z-50 bg-card' : ''} lg:relative lg:block`}>
        <Sidebar onToggle={toggleSidebar} />
        
        {/* Mobile overlay */}
        {isMobile && showSidebar && (
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <ChatArea 
        onToggleSidebar={toggleSidebar}
        onToggleProfilePanel={toggleProfilePanel}
      />

      {/* Profile Panel */}
      {!isMobile && (
        <ProfilePanel 
          isOpen={showProfilePanel}
          onClose={() => setShowProfilePanel(false)}
        />
      )}

      {/* Mobile Profile Panel */}
      {isMobile && showProfilePanel && (
        <div className="fixed inset-0 z-50 bg-card">
          <ProfilePanel 
            onClose={() => setShowProfilePanel(false)}
          />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 z-40">
          <div className="flex items-center justify-around">
            <button 
              className="flex flex-col items-center gap-1 text-primary"
              onClick={toggleSidebar}
              data-testid="mobile-nav-chats"
            >
              <i className="fas fa-comments text-xl" />
              <span className="text-xs">Chats</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="mobile-nav-calls"
            >
              <i className="fas fa-phone text-xl" />
              <span className="text-xs">Calls</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="mobile-nav-contacts"
            >
              <i className="fas fa-users text-xl" />
              <span className="text-xs">Contacts</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={toggleProfilePanel}
              data-testid="mobile-nav-settings"
            >
              <i className="fas fa-cog text-xl" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
