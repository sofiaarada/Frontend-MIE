import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Tema = 'light' | 'dark';

interface ThemeState {
  tema: Tema;
  alternarTema: () => void;
  setTema: (tema: Tema) => void;
}

const aplicarClaseDocumento = (tema: Tema) => {
  const root = document.documentElement;
  root.classList.toggle('dark', tema === 'dark');
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      tema: 'dark',
      alternarTema: () => {
        const nuevo = get().tema === 'dark' ? 'light' : 'dark';
        aplicarClaseDocumento(nuevo);
        set({ tema: nuevo });
      },
      setTema: (tema) => {
        aplicarClaseDocumento(tema);
        set({ tema });
      },
    }),
    {
      name: 'mie-theme',
      onRehydrateStorage: () => (state) => {
        if (state) aplicarClaseDocumento(state.tema);
      },
    }
  )
);
