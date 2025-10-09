import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  logout, 
  resetPassword 
} from '@/lib/auth';
import { useToast } from './use-toast';

export const useAuth = () => {
  const { firebaseUser, user, loading } = useAuthContext();
  const { toast } = useToast();
  const [authLoading, setAuthLoading] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      await signInWithEmail(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    try {
      setAuthLoading(true);
      await signUpWithEmail(email, password, displayName);
      toast({
        title: 'Account created!',
        description: 'Welcome to MessengerPro.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    try {
      signInWithGoogle();
    } catch (error: any) {
      toast({
        title: 'Google sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    try {
      setAuthLoading(true);
      await logout();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await resetPassword(email);
      toast({
        title: 'Password reset sent',
        description: 'Check your email for password reset instructions.',
      });
    } catch (error: any) {
      toast({
        title: 'Password reset failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    firebaseUser,
    user,
    loading: loading || authLoading,
    isAuthenticated: !!firebaseUser,
    signIn: handleSignIn,
    signUp: handleSignUp,
    googleSignIn: handleGoogleSignIn,
    logout: handleLogout,
    resetPassword: handlePasswordReset,
  };
};
