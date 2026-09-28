import React from 'react';
import { AlertTriangle, Trash2, X, Calendar } from 'lucide-react';
import { Employee, LeaveRecord } from '../../types';

interface DeleteEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  leaves: LeaveRecord[];
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
  isOpen,
  employee,
  leaves,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !employee) return null;

  const associatedLeaves = leaves.filter(l => l.employeeId === employee.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-rose-50/70 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base">
              ¿Eliminar empleado de la lista?
            </h3>
            <p className="text-xs text-rose-700 mt-0.5">
              Esta acción dará de baja definitiva al colaborador.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Ficha rápida del empleado */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-xl text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: employee.avatarColor || '#4f46e5' }}
            >
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-900 text-sm truncate">
                {employee.lastName}, {employee.firstName}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                <span className="font-mono font-medium text-slate-700">{employee.documentType} {employee.documentNumber}</span>
                {' • '}{employee.role}
              </p>
              <p className="text-[11px] text-indigo-600 font-medium">
                {employee.department}
              </p>
            </div>
          </div>

          {/* Información sobre licencias asociadas */}
          {associatedLeaves.length > 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>{associatedLeaves.length} {associatedLeaves.length === 1 ? 'ausencia asociada' : 'ausencias asociadas'}</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Este empleado tiene <strong>{associatedLeaves.length}</strong> registro(s) de licencias o días de estudio en el calendario que también se eliminarán automáticamente.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              El colaborador no posee licencias registradas actualmente.
            </p>
          )}

          <p className="text-xs text-slate-600">
            ¿Confirma que desea eliminar a <strong className="text-slate-900">{employee.firstName} {employee.lastName}</strong>?
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sí, Eliminar Empleado</span>
          </button>
        </div>
      </div>
    </div>
  );
};
