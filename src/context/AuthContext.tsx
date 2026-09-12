'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, ReactNode } from 'react';
import { UserProfile } from '@/types';
import { setActiveUser, migrateGuestToUser } from '@/utils/progress';
import { useUser, useClerk } from '@clerk/nextjs';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut } = useClerk();
  const activeUserId = useRef<string | null>(null);

  const user = useMemo<UserProfile | null>(() => {
    if (!isClerkSignedIn || !clerkUser) return null;

    const username =
      clerkUser.username ||
      clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] ||
      clerkUser.id;

    return {
      id: clerkUser.id,
      username,
      name: clerkUser.fullName || clerkUser.firstName || username,
      avatarUrl: clerkUser.imageUrl,
      email: clerkUser.primaryEmailAddress?.emailAddress,
    };
  }, [clerkUser, isClerkSignedIn]);

  useEffect(() => {
    if (!isClerkLoaded) return;

    if (user && activeUserId.current !== user.id) {
      migrateGuestToUser(user.id);
      setActiveUser(user);
      activeUserId.current = user.id;
      return;
    }

    if (!user) {
      setActiveUser(null);
      activeUserId.current = null;
    }
  }, [isClerkLoaded, user]);

  const logout = useCallback(async () => {
    try {
      await signOut({ redirectUrl: '/' });
    } catch {
      await signOut();
    }
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: !isClerkLoaded,
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
