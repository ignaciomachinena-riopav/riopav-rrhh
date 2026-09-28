import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  FileSpreadsheet, 
  UploadCloud, 
  Edit, 
  Trash2, 
  Eye, 
  CalendarPlus,
  Shield,
  Briefcase
} from 'lucide-react';
import { Employee, LeaveRecord } from '../../types';
import { formatDateShort } from '../../utils/dateUtils';
import { DEPARTMENTS } from '../../data/initialData';

interface EmployeeListProps {
  employees: Employee[];
  leaves: LeaveRecord[];
  onOpenEmployeeModal: (emp?: Employee) => void;
  onOpenLeaveModalForEmployee: (employeeId: string) => void;
  onViewEmployeeProfile: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onExportEmployeesExcel: () => void;
  onOpenImportModal: () => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  leaves,
  onOpenEmployeeModal,
  onOpenLeaveModalForEmployee,
  onViewEmployeeProfile,
  onDeleteEmployee,
  onExportEmployeesExcel,
  onOpenImportModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');

  const currentYear = new Date().getFullYear().toString();

  // Filtrado
  const filteredEmployees = employees.filter(emp => {
    if (departmentFilter && emp.department !== departmentFilter) return false;
    if (statusFilter !== 'all' && emp.status !== statusFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchDoc = emp.documentNumber.toLowerCase().includes(term);
      const matchName = (emp.fullName || `${emp.firstName} ${emp.lastName}`).toLowerCase().includes(term);
      const matchArea = emp.department.toLowerCase().includes(term);
      return matchDoc || matchName || matchArea;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Barra de Filtros y Acciones */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por CI, DNI, Nombre completo o Área..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Botones de Excel y Alta */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              title="Importar lista de empleados desde Excel"
            >
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>Cargar Excel</span>
            </button>

            <button
              onClick={onExportEmployeesExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
              title="Exportar nómina completa con saldos a Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Nómina</span>
            </button>

            <button
              onClick={() => onOpenEmployeeModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Empleado</span>
            </button>
          </div>

        </div>

        {/* Filtros secundarios */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtrar por Área:</span>
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium"
          >
            <option value="">Todas las Áreas</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs"
          >
            <option value="all">Todos los Estados</option>
            <option value="activo">Solo Activos</option>
            <option value="inactivo">Solo Inactivos</option>
          </select>

          <span className="text-slate-400 ml-auto">
            Mostrando <strong>{filteredEmployees.length}</strong> de <strong>{employees.length}</strong> empleados
          </span>
        </div>
      </div>

      {/* Banner explicativo de reglas */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span><strong>Vacaciones anuales:</strong> Asignadas a mano. Solo restan días hábiles (Lun-Vie); sábados, domingos y feriados no restan.</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span><strong>Días de estudio:</strong> Solo aplican a quienes estén marcados como estudiantes (no restan de vacaciones).</span>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">Nombre Completo</th>
                <th className="py-3.5 px-4">CI o DNI</th>
                <th className="py-3.5 px-4">Área</th>
                <th className="py-3.5 px-4 text-center">Vacaciones Anuales</th>
                <th className="py-3.5 px-4 text-center">Días de Estudio</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron colaboradores con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  // Calcular días usados
                  const empLeaves = leaves.filter(l => 
                    l.employeeId === emp.id && 
                    l.status === 'aprobado' && 
                    l.startDate.startsWith(currentYear)
                  );
                  const licTaken = empLeaves
                    .filter(l => l.type === 'licencia')
                    .reduce((acc, l) => acc + l.businessDays, 0);
                  const licRemaining = Math.max(0, emp.vacationDaysTotal - licTaken);

                  const studyTaken = empLeaves
                    .filter(l => l.type === 'estudio')
                    .reduce((acc, l) => acc + l.businessDays, 0);
                  const studyRemaining = Math.max(0, emp.studyDaysTotal - studyTaken);

                  const displayName = emp.fullName || `${emp.lastName}, ${emp.firstName}`;

                  return (
                    <tr 
                      key={emp.id}
                      className="hover:bg-slate-50/70 transition group"
                    >
                      {/* Nombre y Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs uppercase"
                            style={{ backgroundColor: emp.avatarColor || '#4f46e5' }}
                          >
                            {displayName.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => onViewEmployeeProfile(emp)}
                                className="font-bold text-slate-900 hover:text-indigo-600 transition text-left cursor-pointer text-sm"
                              >
                                {displayName}
                              </button>
                              {emp.isStudent && (
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                                  🎓 Estudiante
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">Área: {emp.department}</p>
                          </div>
                        </div>
                      </td>

                      {/* Documento / CI o DNI */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-800 font-semibold bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                          <Shield className="w-3 h-3 text-indigo-500" />
                          <span>{emp.documentType} {emp.documentNumber}</span>
                        </span>
                      </td>

                      {/* Área */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {emp.department}
                        </span>
                      </td>

                      {/* Vacaciones Anuales (solo restan lun-vie) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                            <strong className="font-bold text-emerald-950">{licRemaining}</strong> / {emp.vacationDaysTotal} d.
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {licTaken} d. tomados (Lun-Vie)
                          </span>
                        </div>
                      </td>

                      {/* Días de Estudio (solo aplica si es estudiante) */}
                      <td className="py-3 px-4 text-center">
                        {emp.isStudent ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                              <strong className="font-bold text-indigo-950">{studyRemaining}</strong> / {emp.studyDaysTotal} d.
                            </span>
                            <span className="text-[10px] text-indigo-600 mt-0.5 font-medium">
                              no restan de vacaciones
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                              No aplica
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              No es estudiante
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          emp.status === 'activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {emp.status}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewEmployeeProfile(emp)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Ver Legajo y Saldos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenLeaveModalForEmployee(emp.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Cargar Licencia o Día de Estudio"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenEmployeeModal(emp)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Editar Datos"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteEmployee(emp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Eliminar Empleado"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
