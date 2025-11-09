import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Clinician {
  id: string;
  email: string;
  clinicianName: string;
  ownerName: string;
  licenseNumber: string;
  position: string;
  website?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  clinician: Clinician | null;
  _hasHydrated: boolean;
  setAuth: (auth: { accessToken: string; refreshToken: string; clinician: Clinician }) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      clinician: null,
      _hasHydrated: false,
      setAuth: (auth) => set(auth),
      clearAuth: () => set({ accessToken: null, refreshToken: null, clinician: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

