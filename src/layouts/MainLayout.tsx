import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { AsistenteFlotante } from '@/components/asistente/AsistenteFlotante';

export function MainLayout() {
  return (
    <div className="flex min-h-svh bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pb-14 lg:pt-6">
          <Outlet />
        </main>
      </div>
      <OnboardingTour />
      <AsistenteFlotante />
    </div>
  );
}
