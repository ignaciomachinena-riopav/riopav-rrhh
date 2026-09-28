import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  GraduationCap, 
  AlertTriangle, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { Employee, LeaveRecord, LeaveType, Holiday, LeaveStatus } from '../../types';
import { calculateBusinessDays, checkLeaveConflict, formatDateShort } from '../../utils/dateUtils';
import { LEAVE_TYPE_CONFIG, getLeaveTypeConfig } from '../../data/initialData';

interface LeaveModalProps {
  isOpen: boolean;
  employees: Employee[];
  leaves: LeaveRecord[];
  holidays: Holiday[];
  leaveToEdit?: LeaveRecord | null;
  defaultEmployeeId?: string;
  defaultDate?: string;
  onClose: () => void;
  onSave: (leave: LeaveRecord) => void;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  employees,
  leaves,
  holidays,
  leaveToEdit,
  defaultEmployeeId,
  defaultDate,
  onClose,
  onSave
}) => {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [type, setType] = useState<LeaveType>('licencia');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [examSubject, setExamSubject] = useState<string>('');
  const [medicalCertificate, setMedicalCertificate] = useState<string>('');
  const [status, setStatus] = useState<LeaveStatus>('aprobado');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (leaveToEdit) {
      setEmployeeId(leaveToEdit.employeeId);
      setType(leaveToEdit.type === 'estudio' ? 'estudio' : 'licencia');
      setStartDate(leaveToEdit.startDate);
      setEndDate(leaveToEdit.endDate);
      setNotes(leaveToEdit.notes || '');
      setExamSubject(leaveToEdit.examSubject || '');
      setMedicalCertificate(leaveToEdit.medicalCertificate || '');
      setStatus(leaveToEdit.status || 'aprobado');
    } else {
      const todayStr = defaultDate || new Date().toISOString().slice(0, 10);
      setEmployeeId(defaultEmployeeId || (employees.length > 0 ? employees[0].id : ''));
      setType('licencia');
      setStartDate(todayStr);
      setEndDate(todayStr);
      setNotes('');
      setExamSubject('');
      setMedicalCertificate('');
      setStatus('aprobado');
    }
    setError('');
  }, [leaveToEdit, defaultEmployeeId, defaultDate, isOpen, employees]);

  if (!isOpen) return null;

  // Cálculo en tiempo real de días hábiles y corridos
  const { businessDays, totalDays } = calculateBusinessDays(startDate, endDate, holidays);

  // Verificar superposiciones
  const conflict = employeeId && startDate && endDate
    ? checkLeaveConflict(employeeId, startDate, endDate, leaves, leaveToEdit?.id)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('Debe seleccionar un empleado.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Debe seleccionar las fechas de inicio y fin.');
      return;
    }
    if (startDate > endDate) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }
    if (type === 'estudio' && !selectedEmp?.isStudent) {
      setError(`El colaborador ${selectedEmp?.fullName || selectedEmp?.firstName} no está registrado como estudiante y no tiene habilitados días de estudio.`);
      return;
    }
    if (type === 'estudio' && !examSubject.trim()) {
      setError('Para días de estudio, debe indicar la materia o examen a rendir.');
      return;
    }

    const leave: LeaveRecord = {
      id: leaveToEdit ? leaveToEdit.id : `leave-${Date.now()}`,
      employeeId,
      type,
      startDate,
      endDate,
      businessDays: businessDays,
      totalCalendarDays: totalDays,
      status,
      notes: notes.trim(),
      examSubject: type === 'estudio' ? examSubject.trim() : undefined,
      medicalCertificate: medicalCertificate.trim() ? medicalCertificate.trim() : undefined,
      createdAt: leaveToEdit ? leaveToEdit.createdAt : new Date().toISOString().slice(0, 10)
    };

    onSave(leave);
    onClose();
  };

  const selectedEmp = employees.find(e => e.id === employeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              type === 'estudio' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {type === 'estudio' ? <GraduationCap className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {leaveToEdit ? 'Editar Ausencia' : 'Cargar Licencia o Día de Estudio'}
              </h3>
              <p className="text-xs text-slate-500">
                Seleccione el empleado, tipo (Licencia o Día de estudio) y rango de fechas
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Empleado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Colaborador / Empleado <span className="text-rose-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => {
                const newId = e.target.value;
                setEmployeeId(newId);
                const emp = employees.find(x => x.id === newId);
                if (emp && !emp.isStudent && type === 'estudio') {
                  setType('licencia');
                }
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName || `${emp.lastName}, ${emp.firstName}`} — {emp.documentType} {emp.documentNumber} ({emp.department}){emp.isStudent ? ' [🎓 Estudiante]' : ''}
                </option>
              ))}
            </select>

            {selectedEmp && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200/60">
                <span>{selectedEmp.documentType}: <strong className="font-mono text-slate-800">{selectedEmp.documentNumber}</strong></span>
                <span>•</span>
                <span>Área: <strong className="text-slate-800">{selectedEmp.department}</strong></span>
                <span>•</span>
                <span>Vacaciones: <strong className="text-emerald-700">{selectedEmp.vacationDaysTotal} d.</strong></span>
                <span>•</span>
                {selectedEmp.isStudent ? (
                  <span className="text-indigo-700 font-medium inline-flex items-center gap-1">
                    <span>Estudio: <strong>{selectedEmp.studyDaysTotal} d.</strong></span>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.2 rounded font-bold">🎓 Estudiante</span>
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Estudio: <strong className="text-slate-600 font-semibold">No aplica</strong> (No es estudiante)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tipo de Licencia: Solo "Licencia" o "Día de estudio" */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Registro <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Opción 1: Licencia */}
              <button
                type="button"
                onClick={() => setType('licencia')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                  type === 'licencia'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                  type === 'licencia' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  📋
                </div>
                <div>
                  <div className="font-bold text-xs">Licencia</div>
                  <div className="text-[11px] text-slate-500">
                    Vacaciones anuales, médica u ordinaria
                  </div>
                </div>
              </button>

              {/* Opción 2: Día de estudio (Solo si es estudiante) */}
              <button
                type="button"
                disabled={!selectedEmp?.isStudent}
                onClick={() => {
                  if (selectedEmp?.isStudent) {
                    setType('estudio');
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                  !selectedEmp?.isStudent
                    ? 'border-slate-200 bg-slate-100/70 text-slate-400 opacity-70 cursor-not-allowed'
                    : type === 'estudio'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs cursor-pointer'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 cursor-pointer'
                }`}
                title={!selectedEmp?.isStudent ? 'Este colaborador no está registrado como estudiante' : undefined}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                  !selectedEmp?.isStudent 
                    ? 'bg-slate-200 text-slate-400' 
                    : type === 'estudio' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  🎓
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>Día de estudio</span>
                    {!selectedEmp?.isStudent && (
                      <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                        No aplica
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedEmp?.isStudent 
                      ? 'Exámenes y cursada académica' 
                      : 'Solo para colaboradores estudiantes'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Fechas: Inicio y Fin */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Inicio <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (!endDate || endDate < e.target.value) {
                      setEndDate(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Fin <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Cálculo de días */}
            <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Cálculo de jornadas:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    type === 'estudio' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {businessDays} días hábiles (Lun-Vie)
                  </span>
                  <span className="text-slate-400">({totalDays} días corridos)</span>
                </div>
              </div>

              {type === 'licencia' ? (
                <p className="text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200/60">
                  ✓ <strong>{businessDays} día(s) hábil(es)</strong> restarán del cupo de vacaciones anuales. Sábados, domingos y feriados <strong>no se cuentan ni restan</strong>.
                </p>
              ) : (
                <p className="text-[11px] text-indigo-800 bg-indigo-50/80 px-2.5 py-1.5 rounded-lg border border-indigo-200/60">
                  ℹ️ Días de estudio: <strong>estos días no restan</strong> de los días de vacaciones anuales.
                </p>
              )}
            </div>
          </div>

          {/* Advertencia de Superposición de Fechas si existe */}
          {conflict && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Superposición con otra licencia:</p>
                <p>
                  El colaborador ya cuenta con un registro ({getLeaveTypeConfig(conflict.type).label}) del {formatDateShort(conflict.startDate)} al {formatDateShort(conflict.endDate)}.
                </p>
              </div>
            </div>
          )}

          {/* Campo específico para Día de Estudio */}
          {type === 'estudio' && (
            <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200/80 space-y-2">
              <label className="block text-xs font-semibold text-indigo-950">
                Materia / Asignatura / Examen <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={examSubject}
                onChange={(e) => setExamSubject(e.target.value)}
                placeholder="Ej. Derecho Laboral - Facultad de Ciencias Económicas"
                className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-indigo-800">
                Indique la materia o examen rendido para el cómputo y constancia reglamentaria.
              </p>
            </div>
          )}

          {/* Observaciones o Detalle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {type === 'licencia' ? 'Motivo, Certificado o Detalle de la Licencia' : 'Observaciones Adicionales'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={type === 'licencia' ? 'Ej. Vacaciones anuales, reposo médico Dr. González, trámite personal...' : 'Notas para recursos humanos...'}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Estado de Aprobación */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Estado del Registro:</span>
            <div className="flex items-center gap-2">
              {(['aprobado', 'pendiente', 'rechazado'] as LeaveStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1 rounded-lg font-semibold uppercase text-[10px] transition cursor-pointer ${
                    status === st
                      ? st === 'aprobado'
                        ? 'bg-emerald-600 text-white'
                        : st === 'pendiente'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm hover:shadow cursor-pointer"
            >
              {leaveToEdit ? 'Guardar Cambios' : 'Registrar en Calendario'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
