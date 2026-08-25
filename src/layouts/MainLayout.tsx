import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { AsistenteFlotante } from '@/components/asistente/AsistenteFlotante';
import { useTourStore } from '@/store/tourStore';

export function MainLayout() {
  const visto = useTourStore((s) => s.visto);
  const abrirTour = useTourStore((s) => s.abrirTour);

  // Primera vez: el tutorial se abre solo, apenas entró al sistema.
  useEffect(() => {
    if (visto) return;
    const t = setTimeout(abrirTour, 800); // deja asentar el layout antes de medir
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-svh bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
      <OnboardingTour />
      <AsistenteFlotante />
    </div>
  );
}
