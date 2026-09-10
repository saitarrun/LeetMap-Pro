'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types';
import { setActiveUser, migrateGuestToUser } from '@/utils/progress';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  oauthConfigured: boolean;
  isModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithUsername: (username: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [oauthConfigured, setOauthConfigured] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
          setActiveUser(data.user || null);
          setOauthConfigured(Boolean(data.oauthConfigured));
        }
      } catch (err) {
        console.error('Failed to check auth status:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();

    // Check for auth_success or auth_error query params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('auth_success')) {
        toast.success('Successfully signed in with GitHub!');
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.has('auth_error')) {
        toast.error(`Sign in error: ${params.get('auth_error')}`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const openLoginModal = () => setIsModalOpen(true);
  const closeLoginModal = () => setIsModalOpen(false);

  const loginWithUsername = async (username: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to sign in with GitHub profile');
      }

      setUser(data.user);
      setActiveUser(data.user);
      
      // Auto-migrate any solved problems in guest mode to user
      const merged = migrateGuestToUser(data.user.username);
      if (merged > 0) {
        toast.success(`Signed in as @${data.user.username}! Synchronized ${merged} saved problems to your profile.`);
      } else {
        toast.success(`Signed in as @${data.user.username}!`);
      }

      closeLoginModal();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Could not sign in');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setActiveUser(null);
    toast.info('Signed out. Using local guest mode.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        oauthConfigured,
        isModalOpen,
        openLoginModal,
        closeLoginModal,
        loginWithUsername,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
