import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  Plus, 
  Layers, 
  List, 
  GraduationCap, 
  FileText,
  Users,
  Search,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Employee, LeaveRecord, Holiday, CalendarDayInfo } from '../../types';
import { 
  MONTH_NAMES_ES, 
  WEEKDAY_SHORT_ES, 
  getCalendarMonthDays, 
  formatDateISO, 
  formatDateSpanish, 
  formatDateShort 
} from '../../utils/dateUtils';
import { LEAVE_TYPE_CONFIG, getLeaveTypeConfig, DEPARTMENTS } from '../../data/initialData';
import { TimelineView } from './TimelineView';
import { DayDetailModal } from './DayDetailModal';

interface CalendarViewProps {
  employees: Employee[];
  leaves: LeaveRecord[];
  holidays: Holiday[];
  onOpenLeaveModal: (defaultDate?: string) => void;
  onOpenHolidayModal: (defaultDate?: string) => void;
  onEditLeave: (leave: LeaveRecord) => void;
  onDeleteLeave: (leaveId: string) => void;
  onDeleteHoliday: (holidayId: string) => void;
  onSelectEmployee: (emp: Employee) => void;
  onExportMatrixExcel: (year: number, month: number) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  employees,
  leaves,
  holidays,
  onOpenLeaveModal,
  onOpenHolidayModal,
  onEditLeave,
  onDeleteLeave,
  onDeleteHoliday,
  onSelectEmployee,
  onExportMatrixExcel
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  
  // Modos de vista: 'grid' (Mes) | 'timeline' (Cronograma) | 'list' (Listado)
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'list'>('grid');

  // Filtros
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('');

  // Modal de detalle de día
  const [selectedDayInfo, setSelectedDayInfo] = useState<CalendarDayInfo | null>(null);

  // Navegación de fechas
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Filtrar licencias según los criterios seleccionados
  const filteredLeaves = leaves.filter(leave => {
    if (filterLeaveType && leave.type !== filterLeaveType) return false;
    if (filterEmployeeId && leave.employeeId !== filterEmployeeId) return false;
    if (filterDepartment) {
      const emp = employees.find(e => e.id === leave.employeeId);
      if (emp && emp.department !== filterDepartment) return false;
    }
    return true;
  });

  // Generar cuadrícula de días
  const monthDays = getCalendarMonthDays(
    currentYear,
    currentMonth,
    holidays,
    filteredLeaves,
    employees
  );

  // Cuenteo de ausencias del mes seleccionado
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const leavesInMonth = filteredLeaves.filter(l => 
    l.status === 'aprobado' &&
    (l.startDate.startsWith(monthKey) || l.endDate.startsWith(monthKey) || (l.startDate < `${monthKey}-01` && l.endDate > `${monthKey}-31`))
  );

  const licenciaCount = leavesInMonth.filter(l => l.type === 'licencia').length;
  const studyCount = leavesInMonth.filter(l => l.type === 'estudio').length;

  return (
    <div className="space-y-4">
      
      {/* Barra Superior de Control: Navegación, Vistas y Acciones */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Navegación de Mes & Año */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer shadow-2xs"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleGoToday}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition cursor-pointer"
              >
                Hoy
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer shadow-2xs"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 capitalize tracking-tight">
                {MONTH_NAMES_ES[currentMonth]}
              </span>
              <span className="text-xl font-bold text-indigo-600">
                {currentYear}
              </span>
            </div>
          </div>

          {/* Selector de Modo de Vista */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Mes</span>
              </button>

              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cronograma (Gantt)</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>

            {/* Botón rápido exportar matriz mensual Excel */}
            <button
              onClick={() => onExportMatrixExcel(currentYear, currentMonth)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
              title="Descargar matriz mensual en formato Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Excel del Mes</span>
            </button>

            {/* Botón para cargar nuevo feriado manualmente */}
            <button
              onClick={() => onOpenHolidayModal(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition cursor-pointer"
              title="Cargar un nuevo feriado argentino manualmente"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Feriado</span>
            </button>
          </div>

        </div>

        {/* Fila de Filtros Interactivos */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtros:</span>
          </div>

          {/* Filtro por Área */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="">Todas las Áreas</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Filtro por Empleado */}
          <select
            value={filterEmployeeId}
            onChange={(e) => setFilterEmployeeId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los Colaboradores ({employees.length})</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName || `${emp.lastName}, ${emp.firstName}`} ({emp.documentType} {emp.documentNumber} - {emp.department}){emp.isStudent ? ' 🎓' : ''}
              </option>
            ))}
          </select>

          {/* Filtro por Tipo de Licencia */}
          <select
            value={filterLeaveType}
            onChange={(e) => setFilterLeaveType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="">Todos los tipos (Licencia / Día de estudio)</option>
            <option value="licencia">📋 Licencias</option>
            <option value="estudio">🎓 Días de estudio</option>
          </select>

          {/* Botón para limpiar filtros si hay alguno activo */}
          {(filterDepartment || filterEmployeeId || filterLeaveType) && (
            <button
              onClick={() => {
                setFilterDepartment('');
                setFilterEmployeeId('');
                setFilterLeaveType('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition"
            >
              Restablecer filtros
            </button>
          )}

          {/* Resumen de badges del mes actual */}
          <div className="ml-auto hidden xl:flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Resumen del mes:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
              <FileText className="w-3 h-3" /> {licenciaCount} licencias
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium">
              <GraduationCap className="w-3 h-3" /> {studyCount} días de estudio
            </span>
          </div>
        </div>
      </div>

      {/* Contenido según la vista seleccionada */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          
          {/* Cabecera de días de la semana (Lunes a Domingo) */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, idx) => (
              <div 
                key={day} 
                className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${
                  idx >= 5 ? 'text-slate-400 bg-slate-100/50' : 'text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Cuadrícula de 42 celdas del mes */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 border-b border-slate-200">
            {monthDays.map((dayInfo, index) => {
              const { date, dayNumber, isCurrentMonth, isToday, isWeekend, holiday, leaves: dayLeaves } = dayInfo;

              return (
                <div
                  key={`${date}-${index}`}
                  onClick={() => setSelectedDayInfo(dayInfo)}
                  className={`min-h-[110px] p-1.5 transition flex flex-col justify-between group relative cursor-pointer ${
                    !isCurrentMonth 
                      ? 'bg-slate-50/40 text-slate-300' 
                      : isWeekend 
                        ? 'bg-slate-50/60' 
                        : 'bg-white hover:bg-indigo-50/20'
                  } ${isToday ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/15' : ''}`}
                >
                  {/* Fila superior de la celda: Número de día y badge de hoy */}
                  <div className="flex items-center justify-between mb-1">
                    <span 
                      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                        isToday 
                          ? 'bg-indigo-600 text-white shadow-2xs' 
                          : isCurrentMonth 
                            ? 'text-slate-700' 
                            : 'text-slate-300'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {/* Botón rápido "+" al pasar el cursor */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLeaveModal(date);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                      title="Cargar licencia en este día"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Feriado si aplica */}
                  {holiday && (
                    <div 
                      className="mb-1 px-1.5 py-0.5 rounded-md bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-semibold truncate flex items-center gap-1 shadow-2xs"
                      title={`Feriado: ${holiday.name} (${holiday.type})`}
                    >
                      <span>🏖️</span>
                      <span className="truncate">{holiday.name}</span>
                    </div>
                  )}

                  {/* Badges de Empleados que se toman el día */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayLeaves.slice(0, 3).map(({ record, employee }) => {
                      const conf = getLeaveTypeConfig(record.type);

                      return (
                        <div
                          key={record.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayInfo(dayInfo);
                          }}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium flex items-center justify-between gap-1 truncate shadow-2xs border ${conf.bgSoft}`}
                          title={`${employee.lastName}, ${employee.firstName} (${employee.documentNumber}) - ${conf.label}: ${record.notes || record.examSubject || ''}`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: employee.avatarColor || '#4f46e5' }}
                            />
                            <span className="font-semibold truncate">
                              {employee.lastName}, {employee.firstName[0]}.
                            </span>
                          </div>
                          
                          <span className="text-[9px] font-bold uppercase shrink-0 opacity-90">
                            {record.type === 'estudio' ? '🎓 Estudio' : '📋 Licencia'}
                          </span>
                        </div>
                      );
                    })}

                    {dayLeaves.length > 3 && (
                      <div className="text-[10px] font-semibold text-slate-500 text-center py-0.5 bg-slate-100 rounded">
                        +{dayLeaves.length - 3} más...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Vista de Cronograma / Línea de Tiempo Gantt */}
      {viewMode === 'timeline' && (
        <TimelineView
          year={currentYear}
          month={currentMonth}
          employees={employees}
          leaves={filteredLeaves}
          holidays={holidays}
          selectedDepartment={filterDepartment}
          selectedLeaveType={filterLeaveType}
          onSelectLeave={(leave) => onEditLeave(leave)}
          onSelectEmployee={(emp) => onSelectEmployee(emp)}
          onSelectDay={(dateStr) => {
            const dayInfo = monthDays.find(d => d.date === dateStr);
            if (dayInfo) setSelectedDayInfo(dayInfo);
          }}
        />
      )}

      {/* Vista de Lista / Agenda de Ausencias */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Agenda de Licencias del Mes: {MONTH_NAMES_ES[currentMonth]} {currentYear} ({leavesInMonth.length})
            </h3>
            <button
              onClick={() => onOpenLeaveModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cargar Nueva</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {leavesInMonth.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No hay ausencias ni licencias programadas en {MONTH_NAMES_ES[currentMonth]} {currentYear}.
              </div>
            ) : (
              leavesInMonth.map(leave => {
                const emp = employees.find(e => e.id === leave.employeeId);
                const conf = getLeaveTypeConfig(leave.type);

                return (
                  <div key={leave.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: emp?.avatarColor || '#4f46e5' }}
                      >
                        {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {emp ? `${emp.lastName}, ${emp.firstName}` : 'Empleado no encontrado'}
                          </span>
                          {emp && (
                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {emp.documentType} {emp.documentNumber}
                            </span>
                          )}
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${conf.bgSoft}`}>
                            {conf.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {emp?.role} • {emp?.department}
                        </p>
                        {leave.examSubject && (
                          <div className="text-xs text-indigo-700 font-medium mt-1 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Materia: {leave.examSubject}</span>
                          </div>
                        )}
                        {leave.notes && (
                          <p className="text-xs text-slate-600 italic mt-0.5">
                            "{leave.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-800">
                        {formatDateShort(leave.startDate)} al {formatDateShort(leave.endDate)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {leave.businessDays} días hábiles ({leave.totalCalendarDays} corridos)
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditLeave(leave)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Editar
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => onDeleteLeave(leave.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalle de Día */}
      {selectedDayInfo && (
        <DayDetailModal
          dayInfo={selectedDayInfo}
          onClose={() => setSelectedDayInfo(null)}
          onAddLeave={(date) => onOpenLeaveModal(date)}
          onAddHoliday={(date) => onOpenHolidayModal(date)}
          onEditLeave={(leave) => onEditLeave(leave)}
          onDeleteLeave={(id) => {
            onDeleteLeave(id);
            // Actualizar vista del modal
            setSelectedDayInfo(prev => prev ? {
              ...prev,
              leaves: prev.leaves.filter(l => l.record.id !== id)
            } : null);
          }}
          onDeleteHoliday={(id) => {
            onDeleteHoliday(id);
            setSelectedDayInfo(prev => prev ? { ...prev, holiday: undefined } : null);
          }}
        />
      )}

    </div>
  );
};
