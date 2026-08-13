import {
  LayoutDashboard, Building2, Boxes, ClipboardCheck,
  Wrench, Ticket as TicketIcon, BarChart3, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}


export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Espacios', path: '/espacios', icon: Building2, badge: 6 },
  { label: 'Activos', path: '/activos', icon: Boxes },
  { label: 'Tickets', path: '/tickets', icon: TicketIcon, badge: 3 },
  { label: 'Mantenimiento', path: '/mantenimiento', icon: Wrench },
  { label: 'Evaluaciones', path: '/evaluaciones', icon: ClipboardCheck },
  { label: 'Reportes', path: '/reportes', icon: BarChart3 },
  { label: 'Usuarios', path: '/usuarios', icon: Users },
];
