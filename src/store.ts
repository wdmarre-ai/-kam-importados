import { create } from 'zustand';
import { Perfil, Sucursal } from './domain/tipos';

interface AppStore {
  // Auth
  user: any | null;
  perfil: Perfil | null;
  sucursal: Sucursal | null;

  // Actions
  setUser: (user: any) => void;
  setPerfil: (perfil: Perfil) => void;
  setSucursal: (sucursal: Sucursal) => void;
  logout: () => void;
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  perfil: null,
  sucursal: null,

  setUser: (user) => set({ user }),

  setPerfil: (perfil) => set({ perfil }),

  setSucursal: (sucursal) => set({ sucursal }),

  logout: () => set({ user: null, perfil: null, sucursal: null }),
}));
