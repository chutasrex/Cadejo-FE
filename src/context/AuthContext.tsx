// src/context/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import { useSession } from '@/hooks/useSession';

type AuthContextValue = ReturnType<typeof useSession>;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useSession();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}