import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  Calendar, 
  Users, 
  GraduationCap, 
  FileText, 
  Sparkles,
  FileCheck,
  TrendingUp,
  Layers,
  Clock
} from 'lucide-react';
import { Employee, LeaveRecord, Holiday } from '../../types';
import { 
  exportEmployeesToExcel, 
  exportLeavesToExcel, 
  exportMonthlyAttendanceMatrixToExcel, 
  exportFullComprehensiveExcel,
  downloadEmployeeTemplate,
  downloadLeaveTemplate,
  downloadHolidayTemplate
} from '../../utils/excel';
import { MONTH_NAMES_ES } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';

interface ExcelReportsViewProps {
  employees: Employee[];
  leaves: LeaveRecord[];
  holidays: Holiday[];
  onOpenImportModal: () => void;
}

export const ExcelReportsView: React.FC<ExcelReportsViewProps> = ({
  employees,
  leaves,
  holidays,
  onOpenImportModal
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Estadísticas para el resumen
  const currentYearStr = currentYear.toString();
  const yearlyApprovedLeaves = leaves.filter(l => l.status === 'aprobado' && l.startDate.startsWith(currentYearStr));
  const totalLicDays = yearlyApprovedLeaves.filter(l => l.type === 'licencia').reduce((acc, l) => acc + l.businessDays, 0);
  const totalStudyDays = yearlyApprovedLeaves.filter(l => l.type === 'estudio').reduce((acc, l) => acc + l.businessDays, 0);
  const totalLeaveRecords = yearlyApprovedLeaves.length;

  const handleExportWithConfetti = (exportFn: () => void) => {
    exportFn();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Presentación */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Motor de Exportación & Carga Excel (.xlsx)</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Emisión y Carga de Planillas de Recursos Humanos
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100">
            Descargue cronogramas mensuales con códigos de ausencia (LIC, EST, FER), reportes consolidados de nómina con DNI, y saldos de licencias y días de estudio para liquidaciones.
          </p>
        </div>

        {/* Botón flotante para abrir importador */}
        <div className="relative z-10 mt-4 sm:mt-0 flex flex-wrap gap-2 pt-2">
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow hover:bg-emerald-50 transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Cargar Archivo Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Métricas Rápidas del Año */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Plantel Registrado</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{employees.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Empleados activos con DNI</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Días de Licencia</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{totalLicDays}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Días hábiles gozados ({currentYear})</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Días de Estudio</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-950">{totalStudyDays}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Días tomados para estudio/examen</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Ausencias Registradas</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalLeaveRecords}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Total de eventos aprobados ({currentYear})</p>
        </div>
      </div>

      {/* Grid de Reportes Disponibles para Emitir */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Reporte 1: Matriz Mensual Visual */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Cronograma Mensual de Ausencias (Matriz Excel)
            </h3>
            <p className="text-xs text-slate-500">
              Crea un libro Excel con la cuadrícula completa del mes seleccionado: filas con cada empleado (DNI, Nombre, Área) y columnas con los días del mes identificando Licencias (LIC), Días de estudio (EST) y Feriados (FER).
            </p>

            <div className="pt-2 flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 font-medium"
              >
                {MONTH_NAMES_ES.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 font-medium"
              >
                {[2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => handleExportWithConfetti(() => 
              exportMonthlyAttendanceMatrixToExcel(selectedYear, selectedMonth, employees, leaves, holidays)
            )}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Emitir Matriz de {MONTH_NAMES_ES[selectedMonth]} {selectedYear}</span>
          </button>
        </div>

        {/* Reporte 2: Nómina y Saldos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Nómina Completa y Saldos de Días
            </h3>
            <p className="text-xs text-slate-500">
              Planilla con todos los colaboradores registrados, tipo y número de documento (DNI), cargo, fecha de alta, saldo de licencias (asignadas, tomadas, restantes) y días de estudio anuales.
            </p>
          </div>

          <button
            onClick={() => handleExportWithConfetti(() => 
              exportEmployeesToExcel(employees, leaves)
            )}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Emitir Nómina con Saldos (.xlsx)</span>
          </button>
        </div>

        {/* Reporte 3: Histórico de Licencias y Estudios */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Historial de Licencias y Días de Estudio
            </h3>
            <p className="text-xs text-slate-500">
              Reporte detallado de todas las solicitudes y aprobaciones: DNI del empleado, motivo, materia rendida en días de estudio, número de certificado médico, días hábiles y fechas comprendidas.
            </p>
          </div>

          <button
            onClick={() => handleExportWithConfetti(() => 
              exportLeavesToExcel(leaves, employees)
            )}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Emitir Reporte de Licencias (.xlsx)</span>
          </button>
        </div>

        {/* Reporte 4: Libro Completo Multihélice */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-indigo-950 text-base">
              Libro Maestro RRHH (Todo en Uno)
            </h3>
            <p className="text-xs text-indigo-900/80">
              Genera un solo archivo Excel con 4 hojas organizadas: "Empleados", "Licencias y Estudios", "Feriados Oficiales" y estadísticas consolidadas.
            </p>
          </div>

          <button
            onClick={() => handleExportWithConfetti(() => 
              exportFullComprehensiveExcel(employees, leaves, holidays)
            )}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Libro Maestro Completo (.xlsx)</span>
          </button>
        </div>

      </div>

      {/* Descarga de Plantillas de Carga */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>📥</span>
          <span>Plantillas Oficiales de Ejemplo para Cargar al Sistema</span>
        </h3>
        <p className="text-xs text-slate-500">
          Descargue estas plantillas preconfiguradas con encabezados exactos y filas de ejemplo. Puede editarlas en Microsoft Excel, Google Sheets o LibreOffice y luego cargarlas directamente con un solo clic.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={downloadEmployeeTemplate}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 text-left transition flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="font-bold text-xs text-slate-800">Plantilla Empleados</div>
              <div className="text-[11px] text-slate-400">DNI, Nombre, Área, Cupos</div>
            </div>
            <Download className="w-4 h-4 text-indigo-600" />
          </button>

          <button
            onClick={downloadLeaveTemplate}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 text-left transition flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="font-bold text-xs text-slate-800">Plantilla Licencias</div>
              <div className="text-[11px] text-slate-400">Vacaciones, Días de estudio</div>
            </div>
            <Download className="w-4 h-4 text-indigo-600" />
          </button>

          <button
            onClick={downloadHolidayTemplate}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 text-left transition flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="font-bold text-xs text-slate-800">Plantilla Feriados</div>
              <div className="text-[11px] text-slate-400">Fechas y asuetos de empresa</div>
            </div>
            <Download className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </div>

    </div>
  );
};
