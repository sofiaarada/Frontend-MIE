import type {
  Usuario, Espacio, Activo, Ticket, Mantenimiento, Inspeccion, KpiDashboard, Notificacion,
} from '@/types';



export const usuarioActual: Usuario = {
  id: 'u1',
  nombre: 'María Alvarado',
  correo: 'malvarado@infraedu.ar',
  rol: 'COORDINADOR',
  sede: 'Inst. Educativo San Martín',
  activo: true,
  creadoEn: '2024-02-01',
};

export const mockUsuarios: Usuario[] = [
  usuarioActual,
  { id: 'u2', nombre: 'Carlos Rivas', correo: 'crivas@infraedu.ar', rol: 'INSPECTOR', sede: 'Inst. Educativo San Martín', activo: true, creadoEn: '2024-03-10' },
  { id: 'u3', nombre: 'Patricia Núñez', correo: 'pnunez@infraedu.ar', rol: 'MANTENIMIENTO', sede: 'Inst. Educativo San Martín', activo: true, creadoEn: '2024-04-22' },
  { id: 'u4', nombre: 'Luis García', correo: 'lgarcia@infraedu.ar', rol: 'INSPECTOR', sede: 'Sede Norte', activo: false, creadoEn: '2024-01-15' },
];

export const mockKpi: KpiDashboard = {
  espaciosTotales: 48,
  espaciosVariacion: 4,
  activosRegistrados: 1247,
  activosNoRevisados: 56,
  ticketsAbiertos: 14,
  ticketsUrgentes: 3,
  indiceEstadoGlobal: 74,
  indiceObjetivo: 85,
};

export const mockSedes = [
  { id: 's1', nombre: 'Inst. Educativo San Martín' },
  { id: 's2', nombre: 'Sede Norte' },
];

export const tiposEspacio = ['Aula', 'Laboratorio', 'Deportivo', 'Común', 'Servicios', 'Administrativo'];

export const mockEspacios: Espacio[] = [
  { id: 'e1', codigo: 'A-101', nombre: 'Aula 101', tipo: 'Aula', sedeId: 's1', piso: '1er Piso', areaM2: 52, capacidad: 35, estado: 'BUENO', ultimaInspeccion: '2025-07-18', problemasActivos: 1 },
  { id: 'e2', codigo: 'A-102', nombre: 'Aula 102', tipo: 'Aula', sedeId: 's1', piso: '1er Piso', areaM2: 52, capacidad: 35, estado: 'REGULAR', ultimaInspeccion: '2025-07-06', problemasActivos: 2 },
  { id: 'e3', codigo: 'LC-01', nombre: 'Lab. Ciencias', tipo: 'Laboratorio', sedeId: 's1', piso: '2do Piso', areaM2: 68, capacidad: 28, estado: 'DETERIORADO', ultimaInspeccion: '2025-07-13', problemasActivos: 5 },
  { id: 'e4', codigo: 'LB-02', nombre: 'Lab. Informática', tipo: 'Laboratorio', sedeId: 's1', piso: '2do Piso', areaM2: 71, capacidad: 30, estado: 'BUENO', ultimaInspeccion: '2025-07-12', problemasActivos: 1 },
  { id: 'e5', codigo: 'G-01', nombre: 'Gimnasio', tipo: 'Deportivo', sedeId: 's1', piso: 'PB', areaM2: 320, capacidad: 130, estado: 'REGULAR', ultimaInspeccion: '2025-07-01', problemasActivos: 3 },
  { id: 'e6', codigo: 'B-01', nombre: 'Biblioteca', tipo: 'Común', sedeId: 's1', piso: '1er Piso', areaM2: 95, capacidad: 60, estado: 'BUENO', ultimaInspeccion: '2025-07-13', problemasActivos: 0 },
  { id: 'e7', codigo: 'B-PB', nombre: 'Baños Planta Baja', tipo: 'Servicios', sedeId: 's1', piso: 'PB', areaM2: 32, capacidad: 0, estado: 'CRITICO', ultimaInspeccion: '2025-07-05', problemasActivos: 8 },
  { id: 'e8', codigo: 'AUD-01', nombre: 'Auditorio', tipo: 'Común', sedeId: 's1', piso: '2do Piso', areaM2: 210, capacidad: 200, estado: 'REGULAR', ultimaInspeccion: '2025-06-30', problemasActivos: 4 },
];

export const categoriasActivo = ['Mobiliario', 'Tecnología', 'Deportivo', 'Sanitario', 'Seguridad'];

export const mockActivos: Activo[] = [
  { id: 'ac1', codigo: 'MOB-0142', nombre: 'Silla Universitaria', categoria: 'Mobiliario', espacioId: 'e1', espacioNombre: 'Aula 101', cantidad: 35, estado: 'BUENO', responsable: 'Carlos Rivas', valor: 85000, fechaAdquisicion: '2022-02-01' },
  { id: 'ac2', codigo: 'MOB-0143', nombre: 'Mesa de Laboratorio', categoria: 'Mobiliario', espacioId: 'e3', espacioNombre: 'Lab. Ciencias', cantidad: 14, estado: 'DETERIORADO', responsable: 'Carlos Rivas', valor: 210000, fechaAdquisicion: '2021-06-01' },
  { id: 'ac3', codigo: 'TEC-0071', nombre: 'Proyector Epson EB', categoria: 'Tecnología', espacioId: 'e1', espacioNombre: 'Aula 101', cantidad: 1, estado: 'REGULAR', responsable: 'Patricia Núñez', valor: 93000, fechaAdquisicion: '2023-03-01' },
  { id: 'ac4', codigo: 'TEC-0072', nombre: 'PC All-in-One', categoria: 'Tecnología', espacioId: 'e4', espacioNombre: 'Lab. Informática', cantidad: 30, estado: 'BUENO', responsable: 'Patricia Núñez', valor: 1800000, fechaAdquisicion: '2023-08-01' },
  { id: 'ac5', codigo: 'DEP-0033', nombre: 'Tablero de Básquet', categoria: 'Deportivo', espacioId: 'e5', espacioNombre: 'Gimnasio', cantidad: 2, estado: 'REGULAR', responsable: 'Carlos Rivas', valor: 45000, fechaAdquisicion: '2020-07-01' },
  { id: 'ac6', codigo: 'MOB-0201', nombre: 'Estantería Metálica', categoria: 'Mobiliario', espacioId: 'e6', espacioNombre: 'Biblioteca', cantidad: 24, estado: 'BUENO', responsable: 'Luis García', valor: 96000, fechaAdquisicion: '2022-11-01' },
  { id: 'ac7', codigo: 'SAN-0015', nombre: 'Inodoro Fluxómetro', categoria: 'Sanitario', espacioId: 'e7', espacioNombre: 'Baños PB', cantidad: 8, estado: 'CRITICO', responsable: 'Patricia Núñez', valor: 120000, fechaAdquisicion: '2019-04-01' },
  { id: 'ac8', codigo: 'TEC-0089', nombre: 'Sistema de Audio', categoria: 'Tecnología', espacioId: 'e8', espacioNombre: 'Auditorio', cantidad: 1, estado: 'DETERIORADO', responsable: 'Carlos Rivas', valor: 195000, fechaAdquisicion: '2021-09-01' },
];

export const mockTickets: Ticket[] = [
  { id: 't1', codigo: 'OT-2025-0121', titulo: 'Reparación cañería baños PB', descripcion: 'Fuga de agua detectada bajo el lavamanos central.', prioridad: 'URGENTE', estado: 'EN_PROCESO', espacioNombre: 'Baños Planta Baja', responsable: 'Carlos Rivas', creadoPor: 'María Alvarado', fechaCreacion: '2025-07-15', fechaVencimiento: '2025-07-18' },
  { id: 't2', codigo: 'OT-2025-0120', titulo: 'Cambio lámparas fluorescentes', descripcion: 'Dos luminarias fuera de servicio.', prioridad: 'MEDIA', estado: 'PENDIENTE', espacioNombre: 'Aula 102', responsable: 'Eric Weisman', creadoPor: 'Luis García', fechaCreacion: '2025-07-15', fechaVencimiento: '2025-07-22' },
  { id: 't3', codigo: 'OT-2025-0119', titulo: 'Restauración mesas laboratorio', descripcion: 'Superficie dañada por reactivos.', prioridad: 'ALTA', estado: 'PENDIENTE', espacioNombre: 'Lab. Ciencias', responsable: 'Diego Llorente', creadoPor: 'Carlos Rivas', fechaCreacion: '2025-07-14', fechaVencimiento: '2025-07-25' },
  { id: 't4', codigo: 'OT-2025-0118', titulo: 'Pintura interior auditorio', descripcion: 'Desprendimiento de pintura en paredes laterales.', prioridad: 'BAJA', estado: 'PENDIENTE', espacioNombre: 'Auditorio', responsable: 'Iván Alonso', creadoPor: 'María Alvarado', fechaCreacion: '2025-07-13', fechaVencimiento: '2025-08-10' },
  { id: 't5', codigo: 'OT-2025-0117', titulo: 'Reparación techo gimnasio', descripcion: 'Filtración de agua en esquina noreste.', prioridad: 'ALTA', estado: 'FINALIZADO', espacioNombre: 'Gimnasio', responsable: 'Beril Cebar', creadoPor: 'María Alvarado', fechaCreacion: '2025-07-15', fechaVencimiento: '2025-07-19' },
  { id: 't6', codigo: 'OT-2025-0116', titulo: 'Calibración proyector Aula 102', descripcion: 'Imagen desenfocada y colores desaturados.', prioridad: 'BAJA', estado: 'FINALIZADO', espacioNombre: 'Aula 102', responsable: 'Ana Torres', creadoPor: 'Luis García', fechaCreacion: '2025-07-10', fechaVencimiento: '2025-07-18' },
];

export const mockMantenimientos: Mantenimiento[] = [
  { id: 'm1', ticketId: 't1', titulo: 'Reparación cañería baños PB', responsable: 'Carlos Rivas', materiales: ['Cañería PVC 1/2"', 'Sellador', 'Llave de paso'], costo: 45000, fechaProgramada: '2026-08-18', estado: 'EN_PROCESO' },
  { id: 'm2', ticketId: 't2', titulo: 'Cambio lámparas fluorescentes', responsable: 'Patricia Núñez', materiales: ['Tubo LED 18W (x5)'], costo: 18000, fechaProgramada: '2026-08-22', estado: 'PENDIENTE' },
  { id: 'm3', ticketId: 't3', titulo: 'Restauración mesas laboratorio', responsable: 'Carlos Rivas', materiales: ['Resina epóxica', 'Lija fina', 'Barniz'], costo: 62000, fechaProgramada: '2026-08-25', estado: 'PENDIENTE' },
  { id: 'm4', titulo: 'Mantenimiento preventivo climatización', responsable: 'Patricia Núñez', materiales: ['Filtros de aire (x4)', 'Gas refrigerante'], costo: 95000, fechaProgramada: '2026-08-14', estado: 'PENDIENTE' },
  { id: 'm5', ticketId: 't5', titulo: 'Reparación techo gimnasio', responsable: 'Luis García', materiales: ['Membrana asfáltica', 'Sellador de techos'], costo: 130000, fechaProgramada: '2026-07-19', estado: 'FINALIZADO' },
  { id: 'm6', ticketId: 't6', titulo: 'Calibración proyector Aula 102', responsable: 'Patricia Núñez', materiales: [], costo: 8000, fechaProgramada: '2026-07-18', estado: 'FINALIZADO' },
  { id: 'm7', titulo: 'Poda y mantenimiento de jardines', responsable: 'Luis García', materiales: ['Combustible desmalezadora'], costo: 22000, fechaProgramada: '2026-08-28', estado: 'PENDIENTE' },
];

export const checklistBase = [
  'Iluminación', 'Mobiliario', 'Pisos y paredes', 'Instalación eléctrica',
  'Ventilación', 'Puertas y ventanas', 'Seguridad', 'Limpieza general',
];

const generarChecklist = (buenos: number, total: number): { id: string; texto: string; cumple: boolean }[] =>
  Array.from({ length: total }, (_, i) => ({
    id: `chk-${i}`,
    texto: checklistBase[i % checklistBase.length] + (i >= checklistBase.length ? ` (${Math.floor(i / checklistBase.length) + 1})` : ''),
    cumple: i < buenos,
  }));

export const mockInspecciones: Inspeccion[] = [
  { id: 'i1', espacioId: 'e3', espacioNombre: 'Lab. Ciencias', inspector: 'Patricia Núñez', fecha: '2026-07-13', puntajeGlobal: 48, itemsBuenos: 22, observaciones: 7, estado: 'DETERIORADO', checklist: generarChecklist(22, 29), notas: 'Mesones con daño por reactivos, requiere restauración.', evidencias: [] },
  { id: 'i2', espacioId: 'e7', espacioNombre: 'Baños Planta Baja', inspector: 'Luis García', fecha: '2026-07-05', puntajeGlobal: 28, itemsBuenos: 10, observaciones: 11, estado: 'CRITICO', checklist: generarChecklist(10, 21), notas: 'Fuga activa bajo el lavamanos central, atención inmediata.', evidencias: [] },
  { id: 'i3', espacioId: 'e8', espacioNombre: 'Auditorio', inspector: 'Sofía Morales', fecha: '2026-06-30', puntajeGlobal: 61, itemsBuenos: 38, observaciones: 5, estado: 'REGULAR', checklist: generarChecklist(38, 43), notas: 'Desprendimiento de pintura en paredes laterales.', evidencias: [] },
  { id: 'i4', espacioId: 'e4', espacioNombre: 'Lab. Informática', inspector: 'Patricia Núñez', fecha: '2026-07-12', puntajeGlobal: 84, itemsBuenos: 25, observaciones: 2, estado: 'BUENO', checklist: generarChecklist(25, 27), notas: 'Sin observaciones relevantes.', evidencias: [] },
  { id: 'i5', espacioId: 'e2', espacioNombre: 'Aula 102', inspector: 'Luis García', fecha: '2026-07-06', puntajeGlobal: 72, itemsBuenos: 20, observaciones: 3, estado: 'REGULAR', checklist: generarChecklist(20, 23), notas: 'Luminarias fuera de servicio en fondo del salón.', evidencias: [] },
];

export const mockNotificaciones: Notificacion[] = [
  { id: 'n1', titulo: 'Fuga de agua detectada', descripcion: 'Baños PB requiere atención inmediata.', tipo: 'Critico', leido: false, fecha: '2025-07-21T08:10:00' },
  { id: 'n2', titulo: '5 luminarias fuera de servicio', descripcion: 'Aula 102.', tipo: 'Advertencia', leido: false, fecha: '2025-07-21T07:40:00' },
  { id: 'n3', titulo: 'Inspección programada', descripcion: 'Lab. Ciencias, mañana 08:00.', tipo: 'Info', leido: false, fecha: '2025-07-20T18:00:00' },
  { id: 'n4', titulo: 'Stock crítico de insumos de limpieza', descripcion: 'Menos del 30% disponible.', tipo: 'Critico', leido: true, fecha: '2025-07-20T09:15:00' },
];

export const mockEvolucionOT = [
  { mes: '10 Jul', completadas: 8, pendientes: 4 },
  { mes: '12 Jul', completadas: 12, pendientes: 6 },
  { mes: '14 Jul', completadas: 10, pendientes: 9 },
  { mes: '16 Jul', completadas: 18, pendientes: 7 },
  { mes: '18 Jul', completadas: 22, pendientes: 5 },
  { mes: '20 Jul', completadas: 19, pendientes: 8 },
];

export const mockEstadoEspacios = [
  { name: 'Bueno', value: 40, color: '#22c55e' },
  { name: 'Regular', value: 31, color: '#f59e0b' },
  { name: 'Deteriorado', value: 18, color: '#f97316' },
  { name: 'Crítico', value: 11, color: '#ef4444' },
];

export const mockPresupuesto = [
  { mes: 'Ene', valor: 320 }, { mes: 'Feb', valor: 280 }, { mes: 'Mar', valor: 410 },
  { mes: 'Abr', valor: 260 }, { mes: 'May', valor: 390 }, { mes: 'Jun', valor: 340 },
  { mes: 'Jul', valor: 420 },
];

export const mockIndiceEvolucion = [
  { mes: 'Ene', indice: 62 }, { mes: 'Feb', indice: 65 }, { mes: 'Mar', indice: 64 },
  { mes: 'Abr', indice: 68 }, { mes: 'May', indice: 70 }, { mes: 'Jun', indice: 71 },
  { mes: 'Jul', indice: 74 },
];

export const mockPresupuestoComparativo = [
  { mes: 'Ene', presupuestado: 320000, real: 298000 },
  { mes: 'Feb', presupuestado: 280000, real: 305000 },
  { mes: 'Mar', presupuestado: 410000, real: 386000 },
  { mes: 'Abr', presupuestado: 260000, real: 241000 },
  { mes: 'May', presupuestado: 390000, real: 412000 },
  { mes: 'Jun', presupuestado: 340000, real: 329000 },
  { mes: 'Jul', presupuestado: 420000, real: 358000 },
];





// Simula latencia real de red para que loaders/skeletons se comporten como en producción.
export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));