import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { disconnectSocket } from '../services/socket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: !!token && !!user,
        });
      },

      updateUser: (updatedFields) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        }));
      },

      logout: () => {
        disconnectSocket();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      isResident: () => get().user?.role === 'RESIDENT',
      isProvider: () => get().user?.role === 'PROVIDER',
      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'neighbourly_auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
