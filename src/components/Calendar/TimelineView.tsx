import React from 'react';
import { Employee, LeaveRecord, Holiday } from '../../types';
import { MONTH_NAMES_ES, WEEKDAY_SHORT_ES } from '../../utils/dateUtils';
import { getLeaveTypeConfig } from '../../data/initialData';
import { GraduationCap, FileText, Info } from 'lucide-react';

interface TimelineViewProps {
  year: number;
  month: number; // 0-11
  employees: Employee[];
  leaves: LeaveRecord[];
  holidays: Holiday[];
  selectedDepartment: string;
  selectedLeaveType: string;
  onSelectLeave: (leave: LeaveRecord) => void;
  onSelectEmployee: (employee: Employee) => void;
  onSelectDay: (dateStr: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  year,
  month,
  employees,
  leaves,
  holidays,
  selectedDepartment,
  selectedLeaveType,
  onSelectLeave,
  onSelectEmployee,
  onSelectDay
}) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filtrar empleados
  const filteredEmployees = employees.filter(emp => {
    if (selectedDepartment && emp.department !== selectedDepartment) return false;
    return true;
  });

  const holidayMap = new Map<string, Holiday>();
  holidays.forEach(h => holidayMap.set(h.date, h));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      
      {/* Explicación de uso */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2 text-slate-600">
          <Info className="w-4 h-4 text-indigo-500" />
          <span>
            Cronograma mensual de ausencias para <strong>{MONTH_NAMES_ES[month]} {year}</strong>. Permite ver quién se ausenta cada día en una sola pantalla.
          </span>
        </div>
        
        {/* Referencias rápidas */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">📋 Licencia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500"></span>
            <span className="text-slate-600 font-medium">🎓 Día de estudio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400"></span>
            <span className="text-slate-600 font-medium">🏖️ Feriado</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          
          {/* Header de días */}
          <div className="grid grid-cols-[260px_repeat(auto-fit,minmax(32px,1fr))] border-b border-slate-200 bg-slate-100/80 sticky top-0 z-10">
            <div className="p-3 text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200 flex items-center">
              Empleado (DNI & Cargo)
            </div>
            
            <div className="grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(30px, 1fr))` }}>
              {daysArray.map(day => {
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const mm = String(month + 1).padStart(2, '0');
                const dd = String(day).padStart(2, '0');
                const dateStr = `${year}-${mm}-${dd}`;
                const holiday = holidayMap.get(dateStr);

                return (
                  <button
                    key={day}
                    onClick={() => onSelectDay(dateStr)}
                    className={`py-2 text-center border-r border-slate-200 transition text-[11px] cursor-pointer hover:bg-indigo-50/50 ${
                      holiday 
                        ? 'bg-amber-100 text-amber-900 font-bold' 
                        : isWeekend 
                          ? 'bg-slate-200/50 text-slate-400' 
                          : 'text-slate-700 font-medium'
                    }`}
                    title={holiday ? `Feriado: ${holiday.name}` : dateStr}
                  >
                    <div className="text-[10px] text-slate-400 font-normal">
                      {WEEKDAY_SHORT_ES[dayOfWeek]}
                    </div>
                    <div className="font-semibold">
                      {day}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filas de Empleados */}
          <div className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No hay empleados que coincidan con los filtros aplicados.
              </div>
            ) : (
              filteredEmployees.map(emp => {
                // Obtener licencias del empleado en este mes
                const empLeaves = leaves.filter(l => {
                  if (l.employeeId !== emp.id) return false;
                  if (l.status === 'rechazado') return false;
                  if (selectedLeaveType && l.type !== selectedLeaveType) return false;

                  const start = new Date(l.startDate);
                  const end = new Date(l.endDate);
                  const monthStart = new Date(year, month, 1);
                  const monthEnd = new Date(year, month + 1, 0);

                  return (start <= monthEnd && end >= monthStart);
                });

                return (
                  <div 
                    key={emp.id} 
                    className="grid grid-cols-[260px_repeat(auto-fit,minmax(32px,1fr))] hover:bg-slate-50/60 transition group items-center"
                  >
                    {/* Columna Empleado */}
                    <div 
                      onClick={() => onSelectEmployee(emp)}
                      className="p-3 border-r border-slate-200 flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/50 transition"
                      title="Ver ficha completa del empleado"
                    >
                      <div 
                        className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: emp.avatarColor || '#4f46e5' }}
                      >
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 text-xs truncate">
                          {emp.lastName}, {emp.firstName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-mono">
                          <span>{emp.documentNumber}</span>
                          <span>•</span>
                          <span className="font-sans truncate">{emp.department}</span>
                        </div>
                      </div>
                    </div>

                    {/* Días del Mes */}
                    <div 
                      className="grid h-12 relative" 
                      style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(30px, 1fr))` }}
                    >
                      {daysArray.map(day => {
                        const date = new Date(year, month, day);
                        const dayOfWeek = date.getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        const mm = String(month + 1).padStart(2, '0');
                        const dd = String(day).padStart(2, '0');
                        const dateStr = `${year}-${mm}-${dd}`;
                        const holiday = holidayMap.get(dateStr);

                        // Comprobar si hay licencia en este día
                        const leave = empLeaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate);
                        const conf = leave ? getLeaveTypeConfig(leave.type) : null;

                        return (
                          <div
                            key={day}
                            onClick={() => onSelectDay(dateStr)}
                            className={`border-r border-slate-100 h-full flex items-center justify-center p-0.5 relative cursor-pointer ${
                              holiday 
                                ? 'bg-amber-50/70' 
                                : isWeekend 
                                  ? 'bg-slate-50' 
                                  : ''
                            }`}
                          >
                            {leave && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectLeave(leave);
                                }}
                                className={`w-full h-8 rounded-md flex items-center justify-center text-[10px] font-semibold text-white transition transform hover:scale-105 shadow-2xs ${conf?.badgeColor || 'bg-indigo-600'}`}
                                title={`${conf?.label}: ${emp.lastName}, ${emp.firstName} (${leave.startDate} a ${leave.endDate}) - ${leave.notes || leave.examSubject || ''}`}
                              >
                                {leave.type === 'estudio' ? '🎓' : '📋'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
