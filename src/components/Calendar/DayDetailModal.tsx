import React from 'react';
import { X, Calendar, Plus, User, GraduationCap, Sun, Activity, Trash2, Edit } from 'lucide-react';
import { CalendarDayInfo, Employee, LeaveRecord, Holiday } from '../../types';
import { formatDateSpanish } from '../../utils/dateUtils';
import { getLeaveTypeConfig } from '../../data/initialData';

interface DayDetailModalProps {
  dayInfo: CalendarDayInfo | null;
  onClose: () => void;
  onAddLeave: (defaultDate: string) => void;
  onAddHoliday: (defaultDate: string) => void;
  onEditLeave: (leave: LeaveRecord) => void;
  onDeleteLeave: (leaveId: string) => void;
  onDeleteHoliday?: (holidayId: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  dayInfo,
  onClose,
  onAddLeave,
  onAddHoliday,
  onEditLeave,
  onDeleteLeave,
  onDeleteHoliday
}) => {
  if (!dayInfo) return null;

  const { date, holiday, leaves, isWeekend } = dayInfo;
  const formattedDate = formatDateSpanish(date, true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{formattedDate}</h3>
              <p className="text-xs text-slate-500">
                {isWeekend ? 'Fin de semana' : 'Día laboral'} • {leaves.length} personas ausentes
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Feriado si hay */}
          {holiday && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏖️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-amber-900 text-sm">{holiday.name}</h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      {holiday.type}
                    </span>
                  </div>
                  {holiday.description && (
                    <p className="text-xs text-amber-800 mt-1">{holiday.description}</p>
                  )}
                </div>
              </div>
              {onDeleteHoliday && (
                <button
                  onClick={() => onDeleteHoliday(holiday.id)}
                  title="Eliminar feriado"
                  className="text-amber-700 hover:text-amber-950 p-1 rounded hover:bg-amber-100 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Lista de Empleados Ausentes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Personal con Licencia / Día Tomado ({leaves.length})
              </h4>
            </div>

            {leaves.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No hay licencias registradas este día</p>
                <p className="text-xs text-slate-400 mt-0.5">El plantel completo se encuentra disponible</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {leaves.map(({ record, employee }) => {
                  const conf = getLeaveTypeConfig(record.type);

                  return (
                    <div 
                      key={record.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-2xs"
                            style={{ backgroundColor: employee.avatarColor || '#4f46e5' }}
                          >
                            {employee.firstName[0]}{employee.lastName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 text-sm">
                                {employee.lastName}, {employee.firstName}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {employee.documentType} {employee.documentNumber}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{employee.role} • {employee.department}</p>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onClose();
                              onEditLeave(record);
                            }}
                            className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Editar licencia"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteLeave(record.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Eliminar licencia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Detalles de la licencia */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[11px] ${conf.bgSoft}`}>
                            <span>{conf.icon}</span>
                            <span>{conf.label}</span>
                          </span>
                          <span className="text-slate-500">
                            Del {record.startDate} al {record.endDate} ({record.businessDays} d. hábiles)
                          </span>
                        </div>
                      </div>

                      {record.examSubject && (
                        <div className="text-xs bg-indigo-50/70 text-indigo-900 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Materia: {record.examSubject}</span>
                        </div>
                      )}

                      {record.medicalCertificate && (
                        <div className="text-xs bg-rose-50/70 text-rose-900 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                          <Activity className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Certificado: {record.medicalCertificate}</span>
                        </div>
                      )}

                      {record.notes && (
                        <p className="text-xs text-slate-600 italic bg-slate-50 px-2.5 py-1.5 rounded-lg">
                          "{record.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer: Quick Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          {!holiday && (
            <button
              onClick={() => {
                onClose();
                onAddHoliday(date);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Marcar Feriado</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onAddLeave(date);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cargar Licencia en esta Fecha</span>
          </button>
        </div>

      </div>
    </div>
  );
};
