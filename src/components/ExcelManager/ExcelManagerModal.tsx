import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Sparkles,
  Info
} from 'lucide-react';
import { Employee, LeaveRecord, Holiday } from '../../types';
import { 
  exportEmployeesToExcel, 
  exportLeavesToExcel, 
  exportMonthlyAttendanceMatrixToExcel, 
  exportFullComprehensiveExcel,
  downloadEmployeeTemplate,
  downloadLeaveTemplate,
  downloadHolidayTemplate,
  parseEmployeesExcel,
  parseLeavesExcel,
  parseHolidaysExcel
} from '../../utils/excel';
import { MONTH_NAMES_ES } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';

interface ExcelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  leaves: LeaveRecord[];
  holidays: Holiday[];
  onImportEmployees: (newEmployees: Partial<Employee>[]) => void;
  onImportLeaves: (newLeaves: Partial<LeaveRecord>[]) => void;
  onImportHolidays: (newHolidays: Holiday[]) => void;
}

export const ExcelManagerModal: React.FC<ExcelManagerModalProps> = ({
  isOpen,
  onClose,
  employees,
  leaves,
  holidays,
  onImportEmployees,
  onImportLeaves,
  onImportHolidays
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // Estados para exportación
  const [matrixYear, setMatrixYear] = useState<number>(new Date().getFullYear());
  const [matrixMonth, setMatrixMonth] = useState<number>(new Date().getMonth());

  // Estados para importación
  const [importType, setImportType] = useState<'employees' | 'leaves' | 'holidays'>('employees');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importFeedback, setImportFeedback] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportFeedback(null);

    try {
      if (importType === 'employees') {
        const result = await parseEmployeesExcel(file);
        if (result.success && result.employees.length > 0) {
          onImportEmployees(result.employees);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          setImportFeedback({
            success: true,
            message: `¡Se importaron ${result.employees.length} empleados correctamente con sus documentos y legajos!`,
            details: result.errors
          });
        } else {
          setImportFeedback({
            success: false,
            message: 'No se pudieron importar empleados del archivo.',
            details: result.errors
          });
        }
      } else if (importType === 'leaves') {
        const result = await parseLeavesExcel(file, employees);
        if (result.success && result.leaves.length > 0) {
          onImportLeaves(result.leaves);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          setImportFeedback({
            success: true,
            message: `¡Se cargaron ${result.leaves.length} licencias y días de estudio al calendario exitosamente!`,
            details: result.errors
          });
        } else {
          setImportFeedback({
            success: false,
            message: 'No se pudieron importar licencias.',
            details: result.errors
          });
        }
      } else if (importType === 'holidays') {
        const result = await parseHolidaysExcel(file);
        if (result.success && result.holidays.length > 0) {
          onImportHolidays(result.holidays);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          setImportFeedback({
            success: true,
            message: `¡Se cargaron ${result.holidays.length} feriados al calendario!`,
            details: result.errors
          });
        } else {
          setImportFeedback({
            success: false,
            message: 'No se pudieron importar los feriados.',
            details: result.errors
          });
        }
      }
    } catch (err: any) {
      setImportFeedback({
        success: false,
        message: `Error al leer el archivo: ${err.message}`
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Centro de Carga y Emisión Excel (RRHH)
              </h3>
              <p className="text-xs text-slate-500">
                Importación y exportación de calendarios, ausencias y lista de empleados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Solapa (Emitir vs Cargar) */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Emitir Reportes Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Cargar Calendarios y Empleados (Excel / CSV)</span>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* SECCIÓN EMITIR / EXPORTAR */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              
              {/* Opción 1: Matriz Mensual Visual */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-100 text-emerald-800">📊</span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Matriz Mensual de Asistencia y Licencias
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    Genera una cuadrícula en Excel con los empleados en filas y todos los días del mes en columnas, identificando VAC (vacaciones), EST (estudio), MED (médica), FER (feriado) y FIN (fin de semana).
                  </p>
                  
                  {/* Selectores de Mes y Año */}
                  <div className="flex items-center gap-2 pt-2">
                    <select
                      value={matrixMonth}
                      onChange={(e) => setMatrixMonth(Number(e.target.value))}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {MONTH_NAMES_ES.map((m, idx) => (
                        <option key={m} value={idx}>{m}</option>
                      ))}
                    </select>

                    <select
                      value={matrixYear}
                      onChange={(e) => setMatrixYear(Number(e.target.value))}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {[2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => exportMonthlyAttendanceMatrixToExcel(matrixYear, matrixMonth, employees, leaves, holidays)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Matriz</span>
                </button>
              </div>

              {/* Opción 2: Nómina Completa con Saldos */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-blue-100 text-blue-800">👥</span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Nómina de Empleados con Saldos de Días
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    Listado de todo el plantel con DNI, área, cargo, fecha de ingreso, días de licencia asignados vs gozados, y saldo restante de días de estudio.
                  </p>
                </div>

                <button
                  onClick={() => exportEmployeesToExcel(employees, leaves)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition shadow-2xs shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Exportar Nómina</span>
                </button>
              </div>

              {/* Opción 3: Registro de Licencias y Estudios */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-100 text-indigo-800">📋</span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Historial de Licencias y Exámenes Rendidos
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    Detalle cronológico de cada ausencia aprobada, materia/examen declarado en días de estudio, certificados médicos cargados y días hábiles consumidos.
                  </p>
                </div>

                <button
                  onClick={() => exportLeavesToExcel(leaves, employees)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition shadow-2xs shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Exportar Licencias</span>
                </button>
              </div>

              {/* Opción 4: Paquete Completo Todo en Uno */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-indigo-950 text-sm">
                      Libro Integral RRHH (Todas las Hojas)
                    </h4>
                  </div>
                  <p className="text-xs text-indigo-900/80 max-w-md">
                    Descarga un archivo .xlsx completo con pestañas separadas para Empleados, Licencias, Feriados y Saldos Consolidados. Ideal para copias de seguridad o auditoría.
                  </p>
                </div>

                <button
                  onClick={() => exportFullComprehensiveExcel(employees, leaves, holidays)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Libro Integral</span>
                </button>
              </div>

            </div>
          )}

          {/* SECCIÓN CARGAR / IMPORTAR */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              
              {/* Selector de qué desea cargar */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  1. Seleccione qué datos desea cargar:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setImportType('employees');
                      setImportFeedback(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      importType === 'employees'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Lista de Empleados</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Nombre completo, CI/DNI, Área (Backoffice, Legales, Mesa, Administración), días de vacaciones y estudio.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImportType('leaves');
                      setImportFeedback(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      importType === 'leaves'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Licencias y Estudios</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Carga masiva de ausencias por DNI y fechas.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImportType('holidays');
                      setImportFeedback(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      importType === 'holidays'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                      <span>🏖️</span>
                      <span>Feriados y Asuetos</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Carga de feriados específicos o locales.
                    </p>
                  </button>
                </div>
              </div>

              {/* Descargar Plantilla de Ejemplo */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    ¿No tiene un archivo con el formato exacto? Descargue una plantilla modelo:
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (importType === 'employees') downloadEmployeeTemplate();
                    else if (importType === 'leaves') downloadLeaveTemplate();
                    else downloadHolidayTemplate();
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Plantilla ({importType === 'employees' ? 'Empleados' : importType === 'leaves' ? 'Licencias' : 'Feriados'})</span>
                </button>
              </div>

              {/* Área de Carga / Drag & Drop */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  2. Suba su archivo Excel (.xlsx, .xls) o CSV:
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition cursor-pointer"
                >
                  <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-slate-800">
                    Haga clic aquí para seleccionar el archivo Excel
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Archivos compatibles: .xlsx, .xls, .csv
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* Estado de procesamiento */}
              {isProcessing && (
                <div className="p-4 rounded-xl bg-indigo-50 text-indigo-800 text-xs flex items-center justify-center gap-2 font-medium">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando archivo Excel y validando registros...</span>
                </div>
              )}

              {/* Feedback de Importación */}
              {importFeedback && (
                <div className={`p-4 rounded-xl text-xs space-y-2 border ${
                  importFeedback.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {importFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{importFeedback.message}</span>
                  </div>

                  {importFeedback.details && importFeedback.details.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/40">
                      <p className="font-semibold mb-1">Avisos del procesamiento:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 max-h-32 overflow-y-auto">
                        {importFeedback.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
