import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  LeaveRecord, 
  Holiday 
} from './types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_LEAVES, 
  INITIAL_HOLIDAYS_2026 
} from './data/initialData';
import { Header } from './components/Header';
import { NavigationTabs, MainTab } from './components/NavigationTabs';
import { CalendarView } from './components/Calendar/CalendarView';
import { EmployeeList } from './components/Employees/EmployeeList';
import { EmployeeModal } from './components/Employees/EmployeeModal';
import { EmployeeProfileModal } from './components/Employees/EmployeeProfileModal';
import { DeleteEmployeeModal } from './components/Employees/DeleteEmployeeModal';
import { LeaveList } from './components/Leaves/LeaveList';
import { LeaveModal } from './components/Leaves/LeaveModal';
import { HolidayList } from './components/Holidays/HolidayList';
import { HolidayModal } from './components/Holidays/HolidayModal';
import { ExcelManagerModal } from './components/ExcelManager/ExcelManagerModal';
import { ExcelReportsView } from './components/ExcelManager/ExcelReportsView';
import { 
  exportEmployeesToExcel, 
  exportLeavesToExcel, 
  exportMonthlyAttendanceMatrixToExcel,
  exportFullComprehensiveExcel 
} from './utils/excel';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY_EMPLOYEES = 'rrhh_app_employees_v1';
const STORAGE_KEY_LEAVES = 'rrhh_app_leaves_v2';
const STORAGE_KEY_HOLIDAYS = 'rrhh_app_holidays_argentinos_v2';

function migrateEmployees(rawEmps: any[]): Employee[] {
  if (!Array.isArray(rawEmps)) return INITIAL_EMPLOYEES;
  return rawEmps.map(e => {
    const isStudent = typeof e.isStudent === 'boolean' 
      ? e.isStudent 
      : ['emp-2', 'emp-4', 'emp-7'].includes(e.id);
    return {
      ...e,
      isStudent,
      studyDaysTotal: isStudent ? (e.studyDaysTotal || 10) : 0
    };
  });
}

function migrateLeaves(rawLeaves: any[]): LeaveRecord[] {
  if (!Array.isArray(rawLeaves)) return INITIAL_LEAVES;
  return rawLeaves.map(l => ({
    ...l,
    type: l.type === 'estudio' ? 'estudio' : 'licencia'
  }));
}

export default function App() {
  // 1. Estado de Datos
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
      return saved ? migrateEmployees(JSON.parse(saved)) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [leaves, setLeaves] = useState<LeaveRecord[]>(() => {
    try {
      const v2 = localStorage.getItem(STORAGE_KEY_LEAVES);
      if (v2) {
        return migrateLeaves(JSON.parse(v2));
      }
      const v1 = localStorage.getItem('rrhh_app_leaves_v1');
      if (v1) {
        const migrated = migrateLeaves(JSON.parse(v1));
        localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(migrated));
        return migrated;
      }
      return INITIAL_LEAVES;
    } catch {
      return INITIAL_LEAVES;
    }
  });

  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HOLIDAYS);
      return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS_2026;
    } catch {
      return INITIAL_HOLIDAYS_2026;
    }
  });

  // Guardar en localStorage ante cambios
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error('Error guardando empleados:', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(leaves));
    } catch (e) {
      console.error('Error guardando licencias:', e);
    }
  }, [leaves]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HOLIDAYS, JSON.stringify(holidays));
    } catch (e) {
      console.error('Error guardando feriados:', e);
    }
  }, [holidays]);

  // 2. Estado de Navegación
  const [activeTab, setActiveTab] = useState<MainTab>('calendario');

  // 3. Notificación flotante (Toast)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 4. Modales
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveToEdit, setLeaveToEdit] = useState<LeaveRecord | null>(null);
  const [defaultEmployeeIdForLeave, setDefaultEmployeeIdForLeave] = useState<string>('');
  const [defaultDateForLeave, setDefaultDateForLeave] = useState<string>('');

  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayToEdit, setHolidayToEdit] = useState<Holiday | null>(null);
  const [defaultDateForHoliday, setDefaultDateForHoliday] = useState<string>('');

  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // --- Handlers para Empleados ---
  const handleSaveEmployee = (emp: Employee) => {
    setEmployees(prev => {
      const index = prev.findIndex(e => e.id === emp.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = emp;
        return copy;
      }
      return [emp, ...prev];
    });
    showToast(`Empleado ${emp.firstName} ${emp.lastName} guardado con éxito.`);
  };

  const handleDeleteEmployee = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    setEmployeeToDelete(emp);
  };

  const handleConfirmDeleteEmployee = () => {
    if (!employeeToDelete) return;
    const empId = employeeToDelete.id;
    setEmployees(prev => prev.filter(e => e.id !== empId));
    setLeaves(prev => prev.filter(l => l.employeeId !== empId));
    if (selectedEmployeeProfile?.id === empId) setSelectedEmployeeProfile(null);
    showToast(`Empleado ${employeeToDelete.firstName} ${employeeToDelete.lastName} y sus registros fueron eliminados.`, 'info');
    setEmployeeToDelete(null);
  };

  // --- Handlers para Licencias ---
  const handleSaveLeave = (leave: LeaveRecord) => {
    setLeaves(prev => {
      const index = prev.findIndex(l => l.id === leave.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = leave;
        return copy;
      }
      return [leave, ...prev];
    });
    showToast('Licencia registrada en el calendario correctamente.');
  };

  const handleDeleteLeave = (leaveId: string) => {
    setLeaves(prev => prev.filter(l => l.id !== leaveId));
    showToast('Licencia eliminada.', 'info');
  };

  // --- Handlers para Feriados ---
  const handleSaveHoliday = (holiday: Holiday) => {
    setHolidays(prev => {
      const index = prev.findIndex(h => h.id === holiday.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = holiday;
        return copy;
      }
      return [...prev, holiday];
    });
    showToast('Feriado cargado en el calendario.');
  };

  const handleDeleteHoliday = (holidayId: string) => {
    setHolidays(prev => prev.filter(h => h.id !== holidayId));
    showToast('Feriado eliminado del calendario.', 'info');
  };

  const handleRestoreOfficialHolidays = () => {
    setHolidays(INITIAL_HOLIDAYS_2026);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    showToast('Feriados oficiales nacionales 2026 recargados con éxito.');
  };

  // --- Handlers para Importación Masiva Excel ---
  const handleImportEmployees = (newEmps: Partial<Employee>[]) => {
    setEmployees(prev => {
      const existingDniMap = new Map<string, number>();
      prev.forEach((e, idx) => {
        const clean = e.documentNumber.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
        existingDniMap.set(clean, idx);
      });

      const updated = [...prev];
      newEmps.forEach(emp => {
        const cleanDni = (emp.documentNumber || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
        if (existingDniMap.has(cleanDni)) {
          const idx = existingDniMap.get(cleanDni)!;
          updated[idx] = { ...updated[idx], ...emp } as Employee;
        } else {
          updated.push(emp as Employee);
        }
      });

      return updated;
    });
  };

  const handleImportLeaves = (newLeaves: Partial<LeaveRecord>[]) => {
    setLeaves(prev => [...(newLeaves as LeaveRecord[]), ...prev]);
  };

  const handleImportHolidays = (newHols: Holiday[]) => {
    setHolidays(prev => {
      const existingDates = new Set(prev.map(h => h.date));
      const filtered = newHols.filter(h => !existingDates.has(h.date));
      return [...prev, ...filtered];
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Principal */}
      <Header
        employees={employees}
        leaves={leaves}
        holidays={holidays}
        onOpenEmployeeModal={() => {
          setEmployeeToEdit(null);
          setIsEmployeeModalOpen(true);
        }}
        onOpenLeaveModal={() => {
          setLeaveToEdit(null);
          setDefaultEmployeeIdForLeave('');
          setDefaultDateForLeave('');
          setIsLeaveModalOpen(true);
        }}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onExportQuickExcel={() => exportEmployeesToExcel(employees, leaves)}
      />

      {/* Barra de Solapas */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        employeeCount={employees.length}
        leaveCount={leaves.length}
        holidayCount={holidays.length}
      />

      {/* Contenedor Principal de la Vista Activa */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Vista 1: Calendario y Licencias Interactivas */}
        {activeTab === 'calendario' && (
          <CalendarView
            employees={employees}
            leaves={leaves}
            holidays={holidays}
            onOpenLeaveModal={(defaultDate) => {
              setLeaveToEdit(null);
              setDefaultEmployeeIdForLeave('');
              setDefaultDateForLeave(defaultDate || '');
              setIsLeaveModalOpen(true);
            }}
            onOpenHolidayModal={(defaultDate) => {
              setHolidayToEdit(null);
              setDefaultDateForHoliday(defaultDate || '');
              setIsHolidayModalOpen(true);
            }}
            onEditLeave={(leave) => {
              setLeaveToEdit(leave);
              setIsLeaveModalOpen(true);
            }}
            onDeleteLeave={handleDeleteLeave}
            onDeleteHoliday={handleDeleteHoliday}
            onSelectEmployee={(emp) => setSelectedEmployeeProfile(emp)}
            onExportMatrixExcel={(y, m) => {
              exportMonthlyAttendanceMatrixToExcel(y, m, employees, leaves, holidays);
              confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
            }}
          />
        )}

        {/* Vista 2: Nómina de Empleados con DNI y Cupos */}
        {activeTab === 'empleados' && (
          <EmployeeList
            employees={employees}
            leaves={leaves}
            onOpenEmployeeModal={(emp) => {
              setEmployeeToEdit(emp || null);
              setIsEmployeeModalOpen(true);
            }}
            onOpenLeaveModalForEmployee={(empId) => {
              setLeaveToEdit(null);
              setDefaultEmployeeIdForLeave(empId);
              setDefaultDateForLeave('');
              setIsLeaveModalOpen(true);
            }}
            onViewEmployeeProfile={(emp) => setSelectedEmployeeProfile(emp)}
            onDeleteEmployee={handleDeleteEmployee}
            onExportEmployeesExcel={() => {
              exportEmployeesToExcel(employees, leaves);
              confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
            }}
            onOpenImportModal={() => setIsExcelModalOpen(true)}
          />
        )}

        {/* Vista 3: Registro Completo de Licencias y Estudios */}
        {activeTab === 'licencias' && (
          <LeaveList
            leaves={leaves}
            employees={employees}
            onOpenLeaveModal={() => {
              setLeaveToEdit(null);
              setDefaultEmployeeIdForLeave('');
              setDefaultDateForLeave('');
              setIsLeaveModalOpen(true);
            }}
            onEditLeave={(leave) => {
              setLeaveToEdit(leave);
              setIsLeaveModalOpen(true);
            }}
            onDeleteLeave={handleDeleteLeave}
            onExportLeavesExcel={() => {
              exportLeavesToExcel(leaves, employees);
              confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
            }}
          />
        )}

        {/* Vista 4: Feriados y Asuetos */}
        {activeTab === 'feriados' && (
          <HolidayList
            holidays={holidays}
            onOpenHolidayModal={() => {
              setHolidayToEdit(null);
              setDefaultDateForHoliday('');
              setIsHolidayModalOpen(true);
            }}
            onEditHoliday={(hol) => {
              setHolidayToEdit(hol);
              setIsHolidayModalOpen(true);
            }}
            onDeleteHoliday={handleDeleteHoliday}
            onRestoreOfficialHolidays={handleRestoreOfficialHolidays}
          />
        )}

        {/* Vista 5: Centro de Reportes & Exportación Excel */}
        {activeTab === 'excel' && (
          <ExcelReportsView
            employees={employees}
            leaves={leaves}
            holidays={holidays}
            onOpenImportModal={() => setIsExcelModalOpen(true)}
          />
        )}

      </main>

      {/* Modal de Alta / Edición de Empleados */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        employeeToEdit={employeeToEdit}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
      />

      {/* Modal Ficha Completa del Empleado */}
      <EmployeeProfileModal
        employee={selectedEmployeeProfile}
        leaves={leaves}
        onClose={() => setSelectedEmployeeProfile(null)}
        onEditEmployee={(emp) => {
          setEmployeeToEdit(emp);
          setIsEmployeeModalOpen(true);
        }}
        onAddLeaveForEmployee={(empId) => {
          setLeaveToEdit(null);
          setDefaultEmployeeIdForLeave(empId);
          setDefaultDateForLeave('');
          setIsLeaveModalOpen(true);
        }}
        onEditLeave={(leave) => {
          setLeaveToEdit(leave);
          setIsLeaveModalOpen(true);
        }}
        onDeleteLeave={handleDeleteLeave}
        onDeleteEmployee={(empId) => {
          setSelectedEmployeeProfile(null);
          handleDeleteEmployee(empId);
        }}
      />

      {/* Modal de Licencias y Días de Estudio */}
      <LeaveModal
        isOpen={isLeaveModalOpen}
        employees={employees}
        leaves={leaves}
        holidays={holidays}
        leaveToEdit={leaveToEdit}
        defaultEmployeeId={defaultEmployeeIdForLeave}
        defaultDate={defaultDateForLeave}
        onClose={() => setIsLeaveModalOpen(false)}
        onSave={handleSaveLeave}
      />

      {/* Modal de Feriados */}
      <HolidayModal
        isOpen={isHolidayModalOpen}
        holidayToEdit={holidayToEdit}
        defaultDate={defaultDateForHoliday}
        onClose={() => setIsHolidayModalOpen(false)}
        onSave={handleSaveHoliday}
      />

      {/* Modal de Centro de Carga y Emisión Excel */}
      <ExcelManagerModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        employees={employees}
        leaves={leaves}
        holidays={holidays}
        onImportEmployees={handleImportEmployees}
        onImportLeaves={handleImportLeaves}
        onImportHolidays={handleImportHolidays}
      />

      {/* Modal de Confirmación de Baja de Empleado */}
      <DeleteEmployeeModal
        isOpen={!!employeeToDelete}
        employee={employeeToDelete}
        leaves={leaves}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmDeleteEmployee}
      />

    </div>
  );
}
