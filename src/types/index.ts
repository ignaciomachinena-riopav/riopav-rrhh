export type DocumentType = 'CI' | 'DNI';

export const VALID_AREAS = ['Backoffice', 'Legales', 'Mesa', 'Administración'] as const;
export type AreaType = typeof VALID_AREAS[number];

export type LeaveType = 'licencia' | 'estudio';

export type LeaveStatus = 'aprobado' | 'pendiente' | 'rechazado';

export interface Employee {
  id: string;
  documentType: DocumentType;
  documentNumber: string; // CI o DNI
  fullName?: string; // Nombre completo
  firstName: string;
  lastName: string;
  department: string; // Área: Backoffice | Legales | Mesa | Administración
  hireDate: string; // YYYY-MM-DD
  vacationDaysTotal: number; // Días de vacaciones anuales
  studyDaysTotal: number; // Días de estudio asignados (solo si es estudiante)
  isStudent: boolean; // Indica si el colaborador es estudiante o no
  status: 'activo' | 'inactivo';
  role?: string;
  email?: string;
  phone?: string;
  avatarColor?: string;
  notes?: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  businessDays: number; // Días hábiles
  totalCalendarDays: number; // Días corridos
  status: LeaveStatus;
  notes: string;
  examSubject?: string; // Para días de estudio (materia, universidad, etc.)
  medicalCertificate?: string; // Para licencia médica (nº certificado, médico)
  createdAt: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'nacional' | 'provincial' | 'puente' | 'empresa';
  description?: string;
}

export interface CalendarDayInfo {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  month: number; // 0-11
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  holiday?: Holiday;
  leaves: {
    record: LeaveRecord;
    employee: Employee;
  }[];
}
