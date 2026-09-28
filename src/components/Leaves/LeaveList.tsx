import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  FileSpreadsheet, 
  Edit, 
  Trash2, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Activity
} from 'lucide-react';
import { Employee, LeaveRecord } from '../../types';
import { formatDateShort } from '../../utils/dateUtils';
import { getLeaveTypeConfig } from '../../data/initialData';

interface LeaveListProps {
  leaves: LeaveRecord[];
  employees: Employee[];
  onOpenLeaveModal: () => void;
  onEditLeave: (leave: LeaveRecord) => void;
  onDeleteLeave: (leaveId: string) => void;
  onExportLeavesExcel: () => void;
}

export const LeaveList: React.FC<LeaveListProps> = ({
  leaves,
  employees,
  onOpenLeaveModal,
  onEditLeave,
  onDeleteLeave,
  onExportLeavesExcel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const employeeMap = new Map<string, Employee>();
  employees.forEach(e => employeeMap.set(e.id, e));

  // Filtrado
  const filteredLeaves = leaves.filter(l => {
    if (typeFilter && l.type !== typeFilter) return false;
    if (statusFilter && l.status !== statusFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const emp = employeeMap.get(l.employeeId);
      const matchDoc = emp?.documentNumber.toLowerCase().includes(term);
      const matchName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(term) : false;
      const matchSubject = l.examSubject?.toLowerCase().includes(term);
      const matchNotes = l.notes.toLowerCase().includes(term);
      return matchDoc || matchName || matchSubject || matchNotes;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por DNI, Nombre de empleado o Materia..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportLeavesExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar a Excel</span>
            </button>

            <button
              onClick={onOpenLeaveModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Ausencia</span>
            </button>
          </div>

        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtrar por:</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium"
          >
            <option value="">Todos los Tipos (Licencia / Día de estudio)</option>
            <option value="licencia">📋 Licencias</option>
            <option value="estudio">🎓 Días de estudio</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs"
          >
            <option value="">Todos los Estados</option>
            <option value="aprobado">Aprobadas</option>
            <option value="pendiente">Pendientes</option>
            <option value="rechazado">Rechazadas</option>
          </select>

          <span className="text-slate-400 ml-auto">
            Registros encontrados: <strong>{filteredLeaves.length}</strong>
          </span>
        </div>
      </div>

      {/* Tabla de Licencias */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">Empleado</th>
                <th className="py-3.5 px-4">Documento (DNI)</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Fechas</th>
                <th className="py-3.5 px-4 text-center">Días Hábiles</th>
                <th className="py-3.5 px-4">Detalle / Materia</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron registros con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(leave => {
                  const emp = employeeMap.get(leave.employeeId);
                  const conf = getLeaveTypeConfig(leave.type);

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/70 transition">
                      {/* Empleado */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                            style={{ backgroundColor: emp?.avatarColor || '#4f46e5' }}
                          >
                            {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '?'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">
                              {emp ? `${emp.lastName}, ${emp.firstName}` : 'Empleado no encontrado'}
                            </span>
                            <p className="text-[11px] text-slate-400">{emp?.department}</p>
                          </div>
                        </div>
                      </td>

                      {/* DNI */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {emp ? `${emp.documentType} ${emp.documentNumber}` : '-'}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${conf.bgSoft}`}>
                          <span>{conf.icon}</span>
                          <span>{conf.label}</span>
                        </span>
                      </td>

                      {/* Fechas */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {formatDateShort(leave.startDate)} al {formatDateShort(leave.endDate)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {leave.totalCalendarDays} d. corridos
                        </div>
                      </td>

                      {/* Días Hábiles */}
                      <td className="py-3 px-4 text-center font-bold text-indigo-700">
                        {leave.businessDays} d.
                      </td>

                      {/* Detalle / Materia */}
                      <td className="py-3 px-4 max-w-xs">
                        {leave.examSubject && (
                          <div className="text-indigo-800 font-semibold flex items-center gap-1 truncate">
                            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{leave.examSubject}</span>
                          </div>
                        )}
                        {leave.medicalCertificate && (
                          <div className="text-rose-800 font-medium flex items-center gap-1 truncate">
                            <Activity className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{leave.medicalCertificate}</span>
                          </div>
                        )}
                        {leave.notes && (
                          <div className="text-slate-500 italic text-[11px] truncate mt-0.5">
                            {leave.notes}
                          </div>
                        )}
                        {!leave.examSubject && !leave.medicalCertificate && !leave.notes && (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          leave.status === 'aprobado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : leave.status === 'pendiente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {leave.status === 'aprobado' ? <CheckCircle2 className="w-3 h-3" /> : leave.status === 'pendiente' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{leave.status}</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditLeave(leave)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteLeave(leave.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
