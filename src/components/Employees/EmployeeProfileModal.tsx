import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  FileText,
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { Employee, LeaveRecord } from '../../types';
import { formatDateShort, formatDateSpanish } from '../../utils/dateUtils';
import { getLeaveTypeConfig } from '../../data/initialData';

interface EmployeeProfileModalProps {
  employee: Employee | null;
  leaves: LeaveRecord[];
  onClose: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onAddLeaveForEmployee: (employeeId: string) => void;
  onEditLeave: (leave: LeaveRecord) => void;
  onDeleteLeave: (leaveId: string) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  leaves,
  onClose,
  onEditEmployee,
  onDeleteEmployee,
  onAddLeaveForEmployee,
  onEditLeave,
  onDeleteLeave
}) => {
  if (!employee) return null;

  const currentYear = new Date().getFullYear().toString();
  const empLeaves = leaves.filter(l => l.employeeId === employee.id && l.status === 'aprobado');

  // Cálculos de días utilizados en el año en curso
  const licLeaves = empLeaves.filter(l => l.type === 'licencia' && l.startDate.startsWith(currentYear));
  const licDaysTaken = licLeaves.reduce((acc, l) => acc + l.businessDays, 0);
  const licDaysRemaining = Math.max(0, employee.vacationDaysTotal - licDaysTaken);

  const studyLeaves = empLeaves.filter(l => l.type === 'estudio' && l.startDate.startsWith(currentYear));
  const studyDaysTaken = studyLeaves.reduce((acc, l) => acc + l.businessDays, 0);
  const studyDaysRemaining = Math.max(0, employee.studyDaysTotal - studyDaysTaken);

  const totalAbsenceDays = licDaysTaken + studyDaysTaken;
  const displayName = employee.fullName || `${employee.lastName}, ${employee.firstName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header con Perfil */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl text-white flex items-center justify-center font-bold text-xl shadow-md uppercase"
              style={{ backgroundColor: employee.avatarColor || '#4f46e5' }}
            >
              {displayName.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  {displayName}
                </h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  employee.status === 'activo' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {employee.status === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-800">
                  {employee.documentType}: {employee.documentNumber}
                </span>
                <span>•</span>
                <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                  Área: {employee.department}
                </span>
                <span>•</span>
                {employee.isStudent ? (
                  <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-200 inline-flex items-center gap-1">
                    🎓 Estudiante
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded border border-slate-200">
                    No estudiante
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onEditEmployee(employee);
              }}
              className="text-slate-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
              title="Editar empleado"
            >
              <Edit className="w-4 h-4" />
            </button>
            {onDeleteEmployee && (
              <button
                onClick={() => {
                  onDeleteEmployee(employee.id);
                }}
                className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                title="Eliminar empleado"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Tarjetas de Saldo de Días */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Días de Licencia (Vacaciones) */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Vacaciones Anuales
                  </span>
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-950">{licDaysRemaining}</span>
                  <span className="text-xs text-emerald-700 font-medium">días hábiles restan</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Cupo anual: <strong>{employee.vacationDaysTotal} días</strong> ({licDaysTaken} d. tomados)
                </p>
              </div>
              <div className="mt-3 text-[10px] text-emerald-900 bg-white/80 p-2 rounded border border-emerald-200/60 leading-tight">
                ✓ Solo restan días hábiles (Lun-Vie). Sábados, domingos y feriados no restan.
              </div>
            </div>

            {/* Días de Estudio */}
            {employee.isStudent ? (
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                      Días de Estudio
                    </span>
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-indigo-950">{studyDaysRemaining}</span>
                    <span className="text-xs text-indigo-700 font-medium">días disponibles</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 mt-1">
                    Cupo anual: <strong>{employee.studyDaysTotal} días</strong> ({studyDaysTaken} d. tomados)
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-indigo-900 bg-white/80 p-2 rounded border border-indigo-200/60 leading-tight">
                  🎓 <strong>Estudiante activo:</strong> No restan del saldo de vacaciones.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Días de Estudio
                    </span>
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-slate-600">No aplica</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    No registrado como estudiante
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200 leading-tight">
                  Los días de estudio solo aplican a colaboradores registrados como estudiantes.
                </div>
              </div>
            )}

            {/* Resumen Total Ausencias */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Ausencias {currentYear}
                  </span>
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{totalAbsenceDays}</span>
                  <span className="text-xs text-slate-600 font-medium">días totales tomados</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {licDaysTaken} d. vacaciones • {studyDaysTaken} d. estudio
                </p>
              </div>
              <div className="mt-3 text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200 leading-tight">
                Historial auditado según calendario de ausencias.
              </div>
            </div>

          </div>

          {/* Información Adicional */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{employee.email || 'Sin correo registrado'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{employee.phone || 'Sin teléfono'}</span>
            </div>
            {employee.notes && (
              <div className="sm:col-span-2 text-slate-600 italic pt-1 border-t border-slate-200/60">
                Nota: {employee.notes}
              </div>
            )}
          </div>

          {/* Historial de Licencias */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Historial de Licencias y Exámenes ({empLeaves.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onAddLeaveForEmployee(employee.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cargar Licencia</span>
              </button>
            </div>

            {empLeaves.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No hay licencias registradas aún para este colaborador.
              </div>
            ) : (
              <div className="space-y-2">
                {empLeaves.map(leave => {
                  const conf = getLeaveTypeConfig(leave.type);

                  return (
                    <div 
                      key={leave.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${conf.bgSoft}`}>
                            <span>{conf.icon}</span>
                            <span>{conf.label}</span>
                          </span>
                          <span className="font-bold text-slate-800">
                            {formatDateShort(leave.startDate)} al {formatDateShort(leave.endDate)}
                          </span>
                          <span className="text-slate-500">
                            ({leave.businessDays} d. hábiles / {leave.totalCalendarDays} corridos)
                          </span>
                        </div>
                        {leave.examSubject && (
                          <div className="text-indigo-700 font-medium flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Materia: {leave.examSubject}</span>
                          </div>
                        )}
                        {leave.medicalCertificate && (
                          <div className="text-slate-700 font-medium flex items-center gap-1">
                            <span>Detalle: {leave.medicalCertificate}</span>
                          </div>
                        )}
                        {leave.notes && (
                          <p className="text-slate-500 italic">"{leave.notes}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onClose();
                            onEditLeave(leave);
                          }}
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
