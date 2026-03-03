import { create } from 'zustand';
import type { ICurrentUser } from '@hbc/models';

export interface AuthState {
  currentUser: ICurrentUser | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: ICurrentUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ currentUser: user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () => set({ currentUser: null, isLoading: false, error: null }),
}));
