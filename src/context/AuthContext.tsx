'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthState } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
      }));

      if (event === 'SIGNED_IN') {
        console.log('User signed in, redirecting to dashboard');
        router.push('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to home');
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log('Attempting sign in...');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('Sign in successful');
    } catch (error) {
      console.error('Sign in error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to sign in'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (email: string, password: string, age: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (age < 13 || age > 19) {
        throw new Error('You must be between 13 and 19 years old to sign up.');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { age },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) throw error;

      toast.success('Please check your email to verify your account');
      router.push('/auth/verify');
    } catch (error) {
      console.error('Sign up error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to sign up'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to sign out'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to reset password'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const value = {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 