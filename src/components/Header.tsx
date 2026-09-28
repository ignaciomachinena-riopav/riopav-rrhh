import React from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  FileSpreadsheet, 
  Plus, 
  UploadCloud, 
  Sparkles,
  GraduationCap,
  Sun,
  Activity
} from 'lucide-react';
import { Employee, LeaveRecord, Holiday } from '../types';
import { formatDateSpanish } from '../utils/dateUtils';

interface HeaderProps {
  employees: Employee[];
  leaves: LeaveRecord[];
  holidays: Holiday[];
  onOpenEmployeeModal: () => void;
  onOpenLeaveModal: () => void;
  onOpenExcelModal: () => void;
  onExportQuickExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  employees,
  leaves,
  holidays,
  onOpenEmployeeModal,
  onOpenLeaveModal,
  onOpenExcelModal,
  onExportQuickExcel,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const activeEmployees = employees.filter(e => e.status === 'activo');

  // Personas de licencia hoy
  const onLeaveToday = leaves.filter(l => 
    l.status === 'aprobado' && 
    todayStr >= l.startDate && 
    todayStr <= l.endDate
  );

  // Días de estudio este mes
  const currentMonthStr = todayStr.slice(0, 7);
  const studyDaysThisMonth = leaves.filter(l => 
    l.status === 'aprobado' && 
    l.type === 'estudio' && 
    (l.startDate.startsWith(currentMonthStr) || l.endDate.startsWith(currentMonthStr))
  );

  // Feriado de hoy si existe
  const todayHoliday = holidays.find(h => h.date === todayStr);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Gestión RRHH</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Calendario Licencias
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDateSpanish(todayStr, true)}</span>
                {todayHoliday && (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-medium px-1.5 py-0.2 rounded">
                    🏖️ {todayHoliday.name}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Métricas Rápidas */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Activos</span>
                <span className="font-semibold text-slate-800">{activeEmployees.length} empleados</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 flex items-center gap-2.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">De Licencia Hoy</span>
                <span className="font-semibold text-slate-800">{onLeaveToday.length} personas</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 flex items-center gap-2.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Días de Estudio</span>
                <span className="font-semibold text-slate-800">{studyDaysThisMonth.length} este mes</span>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenExcelModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition shadow-2xs cursor-pointer"
              title="Cargar calendarios, empleados y emitir reportes Excel"
            >
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>Cargar / Emitir Excel</span>
            </button>

            <button
              onClick={onOpenLeaveModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm hover:shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cargar Licencia</span>
            </button>

            <button
              onClick={onOpenEmployeeModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Empleado</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
