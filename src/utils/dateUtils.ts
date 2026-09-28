import { Holiday, LeaveRecord, Employee, CalendarDayInfo } from '../types';

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const WEEKDAY_SHORT_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const WEEKDAY_FULL_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Normaliza fecha a YYYY-MM-DD
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateISO(str: string): Date {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // 12:00 to avoid timezone offset issues
}

export function formatDateSpanish(dateStr: string, includeWeekday: boolean = false): string {
  if (!dateStr) return '';
  const date = parseDateISO(dateStr);
  const day = date.getDate();
  const month = MONTH_NAMES_ES[date.getMonth()];
  const year = date.getFullYear();
  
  if (includeWeekday) {
    const weekday = WEEKDAY_FULL_ES[date.getDay()];
    return `${weekday}, ${day} de ${month} de ${year}`;
  }
  return `${day} de ${month} de ${year}`;
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// Devuelve array de strings YYYY-MM-DD entre startDate y endDate inclusives
export function getDatesInRange(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const start = parseDateISO(startDateStr);
  const end = parseDateISO(endDateStr);

  const curr = new Date(start);
  while (curr <= end) {
    dates.push(formatDateISO(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

/**
 * Calcula los días de vacaciones anuales según la antigüedad laboral:
 * - 20 días hábiles hasta 4 años cumplidos de antigüedad.
 * - A partir de allí, 1 día adicional cada 4 años cumplidos.
 * - Tope máximo de 3 días adicionales hábiles (máximo total: 23 días).
 *
 * Escala:
 * - 0 a 4 años: 20 días
 * - 5 a 8 años: 21 días (20 + 1)
 * - 9 a 12 años: 22 días (20 + 2)
 * - 13 años o más: 23 días (20 + 3 [tope])
 */
export function calculateVacationDaysBySeniority(
  hireDateStr: string,
  referenceDate: Date = new Date()
): {
  vacationDays: number;
  completedYears: number;
  extraDays: number;
  explanation: string;
} {
  if (!hireDateStr) {
    return {
      vacationDays: 20,
      completedYears: 0,
      extraDays: 0,
      explanation: '20 días hábiles base (hasta 4 años)'
    };
  }

  const hireDate = parseDateISO(hireDateStr);
  let years = referenceDate.getFullYear() - hireDate.getFullYear();
  const m = referenceDate.getMonth() - hireDate.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < hireDate.getDate())) {
    years--;
  }
  const completedYears = Math.max(0, years);

  if (completedYears <= 4) {
    return {
      vacationDays: 20,
      completedYears,
      extraDays: 0,
      explanation: `${completedYears} año${completedYears === 1 ? '' : 's'} de antigüedad: 20 días hábiles (hasta 4 años)`
    };
  }

  // A partir de los 4 años: 1 día adicional cada 4 años cumplidos (máximo 3 días adicionales -> tope 23)
  const additionalYears = completedYears - 4;
  const extraDays = Math.min(3, Math.ceil(additionalYears / 4));
  const vacationDays = 20 + extraDays;

  return {
    vacationDays,
    completedYears,
    extraDays,
    explanation: `${completedYears} años de antigüedad: ${vacationDays} días hábiles (20 base + ${extraDays} adicional${extraDays > 1 ? 'es' : ''}${extraDays === 3 ? ' [tope máx. 23]' : ''})`
  };
}

// Calcula días hábiles entre dos fechas (excluyendo sábados, domingos y feriados opcionales)
// Lunes a viernes solamente.
export function calculateBusinessDays(
  startDateStr: string, 
  endDateStr: string, 
  holidays: Holiday[] = []
): { businessDays: number; totalDays: number } {
  if (!startDateStr || !endDateStr) return { businessDays: 0, totalDays: 0 };
  
  const holidayDates = new Set(holidays.map(h => h.date));
  const dates = getDatesInRange(startDateStr, endDateStr);
  let businessDays = 0;

  for (const dateStr of dates) {
    const d = parseDateISO(dateStr);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Domingo, 6 = Sábado
    const isHoliday = holidayDates.has(dateStr);

    // Solo cuentan de lunes a viernes, y que no sean feriados
    if (!isWeekend && !isHoliday) {
      businessDays++;
    }
  }

  return {
    businessDays,
    totalDays: dates.length
  };
}

// Comprueba si un empleado ya tiene una licencia en el rango dado
export function checkLeaveConflict(
  employeeId: string,
  startDateStr: string,
  endDateStr: string,
  existingLeaves: LeaveRecord[],
  currentLeaveId?: string
): LeaveRecord | undefined {
  const range = getDatesInRange(startDateStr, endDateStr);
  const rangeSet = new Set(range);

  return existingLeaves.find(leave => {
    if (leave.employeeId !== employeeId) return false;
    if (currentLeaveId && leave.id === currentLeaveId) return false;
    if (leave.status === 'rechazado') return false;

    const leaveDates = getDatesInRange(leave.startDate, leave.endDate);
    return leaveDates.some(d => rangeSet.has(d));
  });
}

// Genera la cuadrícula de días para el calendario mensual (incluyendo días del mes anterior y posterior para llenar la cuadrícula)
export function getCalendarMonthDays(
  year: number,
  month: number, // 0-indexed
  holidays: Holiday[],
  leaves: LeaveRecord[],
  employees: Employee[]
): CalendarDayInfo[] {
  const employeeMap = new Map<string, Employee>();
  employees.forEach(e => employeeMap.set(e.id, e));

  const holidayMap = new Map<string, Holiday>();
  holidays.forEach(h => holidayMap.set(h.date, h));

  const todayStr = formatDateISO(new Date());

  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  const firstDayIndex = firstDay.getDay(); // 0 es Domingo
  // Ajuste para comenzar en Lunes (0: Lun, 6: Dom)
  const mondayOffset = (firstDayIndex + 6) % 7;

  // Último día del mes
  const lastDay = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDay.getDate();

  const days: CalendarDayInfo[] = [];

  // Días del mes anterior para completar la primera semana
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = mondayOffset - 1; i >= 0; i--) {
    const dayNumber = prevMonthLastDay - i;
    const d = new Date(year, month - 1, dayNumber);
    const dateStr = formatDateISO(d);
    const dayOfWeek = d.getDay();
    days.push({
      date: dateStr,
      dayNumber,
      month: d.getMonth(),
      year: d.getFullYear(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      holiday: holidayMap.get(dateStr),
      leaves: getLeavesForDate(dateStr, leaves, employeeMap)
    });
  }

  // Días del mes corriente
  for (let dayNumber = 1; dayNumber <= totalDaysInMonth; dayNumber++) {
    const d = new Date(year, month, dayNumber);
    const dateStr = formatDateISO(d);
    const dayOfWeek = d.getDay();
    days.push({
      date: dateStr,
      dayNumber,
      month,
      year,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      holiday: holidayMap.get(dateStr),
      leaves: getLeavesForDate(dateStr, leaves, employeeMap)
    });
  }

  // Días del siguiente mes para completar las semanas (6 filas x 7 columnas = 42 celdas máximo)
  const remainingCells = 42 - days.length;
  for (let dayNumber = 1; dayNumber <= remainingCells; dayNumber++) {
    const d = new Date(year, month + 1, dayNumber);
    const dateStr = formatDateISO(d);
    const dayOfWeek = d.getDay();
    days.push({
      date: dateStr,
      dayNumber,
      month: d.getMonth(),
      year: d.getFullYear(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      holiday: holidayMap.get(dateStr),
      leaves: getLeavesForDate(dateStr, leaves, employeeMap)
    });
  }

  return days;
}

function getLeavesForDate(
  dateStr: string,
  leaves: LeaveRecord[],
  employeeMap: Map<string, Employee>
): { record: LeaveRecord; employee: Employee }[] {
  const result: { record: LeaveRecord; employee: Employee }[] = [];

  for (const leave of leaves) {
    if (leave.status === 'rechazado') continue;
    if (dateStr >= leave.startDate && dateStr <= leave.endDate) {
      const emp = employeeMap.get(leave.employeeId);
      if (emp) {
        result.push({ record: leave, employee: emp });
      }
    }
  }

  return result;
}
