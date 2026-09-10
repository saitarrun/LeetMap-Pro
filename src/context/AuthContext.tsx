'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types';
import { setActiveUser, migrateGuestToUser } from '@/utils/progress';
import { toast } from 'sonner';

import { useUser, useClerk } from '@clerk/nextjs';

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

  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut } = useClerk();

  // Initialize session on mount and sync with Clerk
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (isClerkSignedIn && clerkUser) {
      const username =
        clerkUser.username ||
        clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] ||
        clerkUser.id;
      const profile: UserProfile = {
        id: clerkUser.id,
        username,
        name: clerkUser.fullName || clerkUser.firstName || username,
        avatarUrl: clerkUser.imageUrl,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        githubUrl: `https://github.com/${username}`,
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      };
      setUser(profile);
      setActiveUser(profile);
      setIsLoading(false);
      return;
    }

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
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.has('auth_error')) {
        toast.error(`Sign in error: ${params.get('auth_error')}`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [isClerkLoaded, isClerkSignedIn, clerkUser]);

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
        throw new Error(data.error || 'Failed to sign in with profile');
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
      if (isClerkSignedIn) {
        await signOut();
      }
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
