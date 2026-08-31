import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const slides = [
  { icon: Building2, title: 'Bienvenido a MIE', text: 'Gestioná espacios, activos, inspecciones y mantenimiento desde un solo lugar.' },
  { icon: Bell, title: 'Alertas que llegan a tiempo', text: 'La campana concentra tus avisos y permite escalar situaciones a moderación.' },
  { icon: ShieldCheck, title: 'Tu información, siempre disponible', text: 'Las fotos se almacenan en el servidor y los perfiles se administran con roles y bloqueo seguro.' },
];

export function WelcomePage() {
  const [step, setStep] = useState(0); const navigate = useNavigate(); const slide = slides[step]; const Icon = slide.icon;
  const continuar = () => { if (step < slides.length - 1) setStep(step + 1); else { localStorage.setItem('mie-welcome-complete', 'true'); navigate('/login', { replace: true }); } };
  return <main className="flex min-h-svh items-center justify-center bg-surface-50 p-5 dark:bg-surface-950"><section className="w-full max-w-lg rounded-3xl border border-surface-200 bg-white p-8 text-center shadow-elevated dark:border-surface-800 dark:bg-surface-900"><img src="/logo_mie.png" alt="MIE" className="mx-auto h-14 w-14 rounded-2xl object-cover" /><div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10"><Icon className="h-8 w-8" /></div><p className="mt-6 text-xs font-semibold tracking-widest text-primary-600">{step + 1} DE {slides.length}</p><h1 className="mt-2 font-display text-2xl font-bold text-surface-900 dark:text-white">{slide.title}</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-surface-500">{slide.text}</p><div className="mt-8 flex justify-center gap-2">{slides.map((_, index) => <span key={index} className={`h-2 rounded-full ${index === step ? 'w-6 bg-primary-600' : 'w-2 bg-surface-200'}`} />)}</div><div className="mt-8 flex justify-between gap-3"><Button variant="ghost" onClick={() => { localStorage.setItem('mie-welcome-complete', 'true'); navigate('/login', { replace: true }); }}>Omitir</Button><Button onClick={continuar}>{step === slides.length - 1 ? 'Ir a iniciar sesión' : 'Siguiente'}<ArrowRight className="h-4 w-4" /></Button></div></section></main>;
}
