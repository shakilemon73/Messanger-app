import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 animate-pulse-slow" />
      
      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm mb-4">
            <i className="fas fa-comments text-3xl text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to MessengerPro</h1>
          <p className="text-muted-foreground">Connect seamlessly across all your devices</p>
        </div>

        {/* Auth Form Card */}
        <Card className="glass-card rounded-2xl p-8 shadow-2xl animate-fade-in border-border/50 backdrop-blur-xl">
          {isLogin ? (
            <LoginForm onToggle={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggle={() => setIsLogin(true)} />
          )}
        </Card>
      </div>
    </div>
  );
};
