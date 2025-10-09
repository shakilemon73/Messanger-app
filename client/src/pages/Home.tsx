import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to chat page
      setLocation('/chat');
    }
  }, [isAuthenticated, user, setLocation]);

  // This component mainly serves as a redirect
  // The actual chat interface is in the Chat page
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm mb-4">
          <i className="fas fa-comments text-3xl text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground">Loading MessengerPro...</p>
      </div>
    </div>
  );
}
