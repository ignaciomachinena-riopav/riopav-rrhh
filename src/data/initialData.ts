import { Employee, Holiday, LeaveRecord } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    documentType: 'CI',
    documentNumber: '4.892.102-1',
    fullName: 'Martina Gómez',
    firstName: 'Martina',
    lastName: 'Gómez',
    email: 'martina.gomez@riopav.com',
    phone: '+54 11 4589-2101',
    department: 'Administración',
    role: 'Administración',
    hireDate: '2021-03-15',
    avatarColor: '#4f46e5', // Indigo
    vacationDaysTotal: 21,
    studyDaysTotal: 0,
    isStudent: false,
    status: 'activo',
    notes: 'Área de Administración y control de gestión.'
  },
  {
    id: 'emp-2',
    documentType: 'DNI',
    documentNumber: '38.109.542',
    fullName: 'Santiago Rossi',
    firstName: 'Santiago',
    lastName: 'Rossi',
    email: 'santiago.rossi@riopav.com',
    phone: '+54 11 5120-7733',
    department: 'Backoffice',
    role: 'Backoffice',
    hireDate: '2022-06-01',
    avatarColor: '#0891b2', // Cyan
    vacationDaysTotal: 20,
    studyDaysTotal: 10,
    isStudent: true,
    status: 'activo',
    notes: 'Operaciones de soporte Backoffice. Estudiante universitario de Ingeniería de Software (UTN).'
  },
  {
    id: 'emp-3',
    documentType: 'CI',
    documentNumber: '3.991.405-8',
    fullName: 'Valeria Fernández',
    firstName: 'Valeria',
    lastName: 'Fernández',
    email: 'valeria.fernandez@riopav.com',
    phone: '+54 11 6398-4411',
    department: 'Administración',
    role: 'Administración',
    hireDate: '2019-10-10',
    avatarColor: '#059669', // Emerald
    vacationDaysTotal: 21,
    studyDaysTotal: 0,
    isStudent: false,
    status: 'activo',
    notes: 'Cuentas y balances.'
  },
  {
    id: 'emp-4',
    documentType: 'DNI',
    documentNumber: '41.258.741',
    fullName: 'Lucas Benítez',
    firstName: 'Lucas',
    lastName: 'Benítez',
    email: 'lucas.benitez@riopav.com',
    phone: '+54 11 3874-9022',
    department: 'Backoffice',
    role: 'Backoffice',
    hireDate: '2023-02-15',
    avatarColor: '#7c3aed', // Purple
    vacationDaysTotal: 20,
    studyDaysTotal: 10,
    isStudent: true,
    status: 'activo',
    notes: 'Estudiante universitario de Ciencias de la Computación (UBA Exactas).'
  },
  {
    id: 'emp-5',
    documentType: 'CI',
    documentNumber: '4.182.119-3',
    fullName: 'Camila Álvarez',
    firstName: 'Camila',
    lastName: 'Álvarez',
    email: 'camila.alvarez@riopav.com',
    phone: '+54 11 4455-8899',
    department: 'Mesa',
    role: 'Mesa',
    hireDate: '2020-08-20',
    avatarColor: '#ea580c', // Orange
    vacationDaysTotal: 21,
    studyDaysTotal: 0,
    isStudent: false,
    status: 'activo',
    notes: 'Mesa de operaciones.'
  },
  {
    id: 'emp-6',
    documentType: 'DNI',
    documentNumber: '39.741.002',
    fullName: 'Ignacio Machinena',
    firstName: 'Ignacio',
    lastName: 'Machinena',
    email: 'ignacio.machinena@riopav.com',
    phone: '+54 11 7788-9900',
    department: 'Mesa',
    role: 'Mesa',
    hireDate: '2018-01-10',
    avatarColor: '#2563eb', // Blue
    vacationDaysTotal: 21,
    studyDaysTotal: 0,
    isStudent: false,
    status: 'activo',
    notes: 'Operador de Mesa.'
  },
  {
    id: 'emp-7',
    documentType: 'DNI',
    documentNumber: '42.330.981',
    fullName: 'Sofía Morales',
    firstName: 'Sofía',
    lastName: 'Morales',
    email: 'sofia.morales@riopav.com',
    phone: '+54 11 6633-1122',
    department: 'Legales',
    role: 'Legales',
    hireDate: '2023-09-01',
    avatarColor: '#db2777', // Pink
    vacationDaysTotal: 20,
    studyDaysTotal: 10,
    isStudent: true,
    status: 'activo',
    notes: 'Asesoría jurídica. Estudiante de Posgrado en Marketing Digital (UADE).'
  },
  {
    id: 'emp-8',
    documentType: 'CI',
    documentNumber: '2.502.668-4',
    fullName: 'Federico Torres',
    firstName: 'Federico',
    lastName: 'Torres',
    email: 'federico.torres@riopav.com',
    phone: '+54 11 9922-3344',
    department: 'Backoffice',
    role: 'Backoffice',
    hireDate: '2012-04-12',
    avatarColor: '#d97706', // Amber
    vacationDaysTotal: 23,
    studyDaysTotal: 0,
    isStudent: false,
    status: 'activo',
    notes: 'Coordinador de Backoffice.'
  }
];

export const INITIAL_HOLIDAYS_2026: Holiday[] = [
  { id: 'hol-1', date: '2026-01-01', name: 'Año Nuevo', type: 'nacional', description: 'Feriado inamovible nacional' },
  { id: 'hol-2', date: '2026-02-16', name: 'Carnaval (Lunes)', type: 'nacional', description: 'Feriado de carnaval' },
  { id: 'hol-3', date: '2026-02-17', name: 'Carnaval (Martes)', type: 'nacional', description: 'Feriado de carnaval' },
  { id: 'hol-4', date: '2026-03-23', name: 'Feriado Puente Turístico', type: 'puente', description: 'Puente conmutativo' },
  { id: 'hol-5', date: '2026-03-24', name: 'Día Nacional de la Memoria por la Verdad y la Justicia', type: 'nacional', description: 'Inamovible' },
  { id: 'hol-6', date: '2026-04-02', name: 'Día del Veterano y Caídos en Malvinas', type: 'nacional', description: 'Inamovible' },
  { id: 'hol-7', date: '2026-04-03', name: 'Viernes Santo', type: 'nacional', description: 'Semana Santa' },
  { id: 'hol-8', date: '2026-05-01', name: 'Día Internacional del Trabajador', type: 'nacional', description: 'Inamovible' },
  { id: 'hol-9', date: '2026-05-25', name: 'Día de la Revolución de Mayo', type: 'nacional', description: 'Inamovible' },
  { id: 'hol-10', date: '2026-06-15', name: 'Paso a la Inmortalidad del Gral. Güemes', type: 'nacional', description: 'Trasladable' },
  { id: 'hol-11', date: '2026-06-20', name: 'Paso a la Inmortalidad del Gral. Belgrano (Día de la Bandera)', type: 'nacional', description: 'Inamovible' },
  { id: 'hol-12', date: '2026-07-09', name: 'Día de la Independencia', type: 'nacional', description: 'Inamovible' },
  { id: 'hol-13', date: '2026-08-17', name: 'Paso a la Inmortalidad del Gral. José de San Martín', type: 'nacional', description: 'Trasladable' },
  { id: 'hol-14', date: '2026-10-12', name: 'Día del Respeto a la Diversidad Cultural', type: 'nacional', description: 'Trasladable' },
  { id: 'hol-15', date: '2026-11-20', name: 'Día de la Soberanía Nacional', type: 'nacional', description: 'Trasladable' },
  { id: 'hol-16', date: '2026-12-08', name: 'Inmaculada Concepción de María', type: 'nacional', description: 'Inamovible' },
  { id: 'hol-17', date: '2026-12-25', name: 'Navidad', type: 'nacional', description: 'Inamovible' }
];

export const INITIAL_LEAVES: LeaveRecord[] = [
  // Septiembre 2026 (mes actual de prueba)
  {
    id: 'leave-1',
    employeeId: 'emp-2', // Santiago Rossi
    type: 'estudio',
    startDate: '2026-09-24',
    endDate: '2026-09-25',
    businessDays: 2,
    totalCalendarDays: 2,
    status: 'aprobado',
    notes: 'Examen final de Arquitectura de Sistemas Distribuidos',
    examSubject: 'Arquitectura de Software - UTN',
    createdAt: '2026-09-10'
  },
  {
    id: 'leave-2',
    employeeId: 'emp-4', // Lucas Benítez
    type: 'estudio',
    startDate: '2026-09-22',
    endDate: '2026-09-23',
    businessDays: 2,
    totalCalendarDays: 2,
    status: 'aprobado',
    notes: 'Rinde examen parcial de Base de Datos Avanzadas',
    examSubject: 'Bases de Datos II - UBA Exactas',
    createdAt: '2026-09-15'
  },
  {
    id: 'leave-3',
    employeeId: 'emp-5', // Camila Álvarez
    type: 'licencia',
    startDate: '2026-09-14',
    endDate: '2026-09-21',
    businessDays: 6,
    totalCalendarDays: 8,
    status: 'aprobado',
    notes: 'Licencia por descanso anual / receso.',
    createdAt: '2026-08-20'
  },
  {
    id: 'leave-4',
    employeeId: 'emp-3', // Valeria Fernández
    type: 'licencia',
    startDate: '2026-09-21',
    endDate: '2026-09-23',
    businessDays: 3,
    totalCalendarDays: 3,
    status: 'aprobado',
    notes: 'Licencia por razones de salud (reposo médico con certificado).',
    medicalCertificate: 'Cert. Médico Dr. Rossi MN 45.890',
    createdAt: '2026-09-21'
  },
  {
    id: 'leave-5',
    employeeId: 'emp-1', // Martina Gómez
    type: 'licencia',
    startDate: '2026-09-28',
    endDate: '2026-09-28',
    businessDays: 1,
    totalCalendarDays: 1,
    status: 'aprobado',
    notes: 'Licencia por trámite personal y bancario.',
    createdAt: '2026-09-18'
  },
  {
    id: 'leave-6',
    employeeId: 'emp-7', // Sofía Morales
    type: 'estudio',
    startDate: '2026-10-05',
    endDate: '2026-10-06',
    businessDays: 2,
    totalCalendarDays: 2,
    status: 'aprobado',
    notes: 'Examen de Estrategia Digital y Marketing',
    examSubject: 'Marketing Digital Avanzado - UADE',
    createdAt: '2026-09-20'
  },
  {
    id: 'leave-7',
    employeeId: 'emp-6', // Ignacio Machinena
    type: 'licencia',
    startDate: '2026-10-12',
    endDate: '2026-10-23',
    businessDays: 9,
    totalCalendarDays: 12,
    status: 'aprobado',
    notes: 'Licencia anual programada.',
    createdAt: '2026-09-01'
  }
];

export const DEPARTMENTS = [
  'Backoffice',
  'Legales',
  'Mesa',
  'Administración'
];

export interface LeaveTypeDetail {
  label: string;
  badgeColor: string;
  bgSoft: string;
  border: string;
  text: string;
  iconName: string;
  shortCode: string;
  icon: string;
}

export const LEAVE_TYPE_CONFIG: Record<string, LeaveTypeDetail> = {
  licencia: {
    label: 'Licencia',
    badgeColor: 'bg-emerald-600 text-white',
    bgSoft: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    border: 'border-l-4 border-emerald-500',
    text: 'text-emerald-700',
    iconName: 'FileText',
    shortCode: 'LIC',
    icon: '📋'
  },
  estudio: {
    label: 'Día de estudio',
    badgeColor: 'bg-indigo-600 text-white',
    bgSoft: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    border: 'border-l-4 border-indigo-500',
    text: 'text-indigo-700',
    iconName: 'GraduationCap',
    shortCode: 'EST',
    icon: '🎓'
  }
};

export function getLeaveTypeConfig(type: string): LeaveTypeDetail {
  if (type === 'estudio') {
    return LEAVE_TYPE_CONFIG.estudio;
  }
  return LEAVE_TYPE_CONFIG.licencia;
}
