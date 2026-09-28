import React, { useState, useEffect } from 'react';
import { X, User, Shield, Award, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Employee, DocumentType, VALID_AREAS } from '../../types';

interface EmployeeModalProps {
  isOpen: boolean;
  employeeToEdit?: Employee | null;
  onClose: () => void;
  onSave: (employee: Employee) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  employeeToEdit,
  onClose,
  onSave
}) => {
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [department, setDepartment] = useState<string>('Backoffice');
  const [vacationDaysTotal, setVacationDaysTotal] = useState<number>(20);
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [studyDaysTotal, setStudyDaysTotal] = useState<number>(10);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employeeToEdit) {
      const name = employeeToEdit.fullName || 
        (employeeToEdit.firstName && employeeToEdit.lastName 
          ? `${employeeToEdit.firstName} ${employeeToEdit.lastName}` 
          : employeeToEdit.firstName || employeeToEdit.lastName || '');
      setFullName(name);
      setDocumentType(employeeToEdit.documentType === 'CI' ? 'CI' : 'DNI');
      setDocumentNumber(employeeToEdit.documentNumber || '');
      setDepartment(
        VALID_AREAS.includes(employeeToEdit.department as any) 
          ? employeeToEdit.department 
          : 'Backoffice'
      );
      setVacationDaysTotal(employeeToEdit.vacationDaysTotal ?? 20);
      setIsStudent(Boolean(employeeToEdit.isStudent));
      setStudyDaysTotal(employeeToEdit.isStudent ? (employeeToEdit.studyDaysTotal ?? 10) : 10);
    } else {
      setFullName('');
      setDocumentType('DNI');
      setDocumentNumber('');
      setDepartment('Backoffice');
      setVacationDaysTotal(20);
      setIsStudent(false);
      setStudyDaysTotal(10);
    }
    setErrors({});
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!fullName.trim()) {
      err.fullName = 'El nombre completo es obligatorio';
    }
    if (!documentNumber.trim()) {
      err.documentNumber = 'El número de CI o DNI es obligatorio';
    }
    if (vacationDaysTotal < 0 || isNaN(vacationDaysTotal)) {
      err.vacationDaysTotal = 'Indique una cantidad válida de días de vacaciones';
    }
    if (isStudent && (studyDaysTotal < 1 || isNaN(studyDaysTotal))) {
      err.studyDaysTotal = 'Indique una cantidad válida de días de estudio (mínimo 1)';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Descomponer nombre completo en firstName y lastName para retrocompatibilidad
    const trimmedName = fullName.trim();
    const parts = trimmedName.split(/\s+/);
    let firstName = trimmedName;
    let lastName = '';
    if (parts.length > 1) {
      lastName = parts[parts.length - 1];
      firstName = parts.slice(0, -1).join(' ');
    }

    const employee: Employee = {
      id: employeeToEdit ? employeeToEdit.id : `emp-${Date.now()}`,
      documentType,
      documentNumber: documentNumber.trim(),
      fullName: trimmedName,
      firstName,
      lastName,
      department,
      role: department,
      hireDate: employeeToEdit?.hireDate || new Date().toISOString().slice(0, 10),
      avatarColor: employeeToEdit?.avatarColor || (
        department === 'Backoffice' ? '#0891b2' :
        department === 'Legales' ? '#7c3aed' :
        department === 'Mesa' ? '#2563eb' : '#059669'
      ),
      vacationDaysTotal: Number(vacationDaysTotal),
      isStudent: Boolean(isStudent),
      studyDaysTotal: isStudent ? Number(studyDaysTotal) : 0,
      status: employeeToEdit?.status || 'activo',
      email: employeeToEdit?.email || `${firstName.toLowerCase().replace(/\s+/g, '.')}.${lastName.toLowerCase().replace(/\s+/g, '') || 'colab'}@riopav.com`,
      phone: employeeToEdit?.phone || '',
      notes: employeeToEdit?.notes || ''
    };

    onSave(employee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {employeeToEdit ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
              </h3>
              <p className="text-xs text-slate-500">
                Complete los datos del colaborador, vacaciones y condición de estudiante
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* 1. Nombre Completo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre Completo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Juan Carlos Gómez"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium ${
                errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* 2. CI o DNI */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              Documento de Identidad (CI o DNI) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="DNI">DNI (Documento Nacional)</option>
                  <option value="CI">CI (Cédula de Identidad)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder={documentType === 'CI' ? 'Ej. 4.892.102-1' : 'Ej. 38.109.542'}
                  className={`w-full px-3 py-2 text-sm font-mono rounded-lg border bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                    errors.documentNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.documentNumber && (
                  <p className="text-xs text-rose-600 mt-1">{errors.documentNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Área */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Área <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VALID_AREAS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setDepartment(area)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                    department === area
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Días de Vacaciones Anuales (Entrada a mano simple) */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <label className="block text-xs font-bold text-emerald-950">
                Días de Vacaciones Anuales <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={vacationDaysTotal}
                  onChange={(e) => setVacationDaysTotal(parseInt(e.target.value) || 0)}
                  placeholder="20"
                  className="w-full px-3 py-2 text-base font-bold text-center rounded-lg border border-emerald-300 bg-white text-emerald-950 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-xs text-emerald-900 leading-tight">
                Ingrese a mano el total de días de vacaciones anuales asignados.
              </p>
            </div>

            <div className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-lg border border-emerald-200/60 flex items-start gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Cómputo hábil:</strong> Las licencias solo descuentan de lunes a viernes. Los <strong>sábados, domingos y feriados argentinos no se cuentan ni restan</strong>.
              </span>
            </div>
          </div>

          {/* 5. Condición de Estudiante y Días de Estudio */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <GraduationCap className={`w-5 h-5 mt-0.5 shrink-0 ${isStudent ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <label className="block text-xs font-bold text-slate-900">
                    ¿Es Estudiante? <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Los días de estudio solo aplican a colaboradores marcados como estudiantes.
                  </p>
                </div>
              </div>

              {/* Selector Sí / No */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsStudent(false);
                    setStudyDaysTotal(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    !isStudent
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsStudent(true);
                    if (!studyDaysTotal || studyDaysTotal === 0) setStudyDaysTotal(10);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    isStudent
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🎓 Sí, es estudiante</span>
                </button>
              </div>
            </div>

            {/* Si es estudiante: mostrar campo para cargar días de estudio */}
            {isStudent ? (
              <div className="pt-3 border-t border-indigo-100 bg-indigo-50/70 -mx-4 -mb-4 p-4 rounded-b-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-indigo-950">
                    Días de Estudio Anuales Asignados <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-full">
                    Habilitado para licencias de estudio
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={studyDaysTotal}
                      onChange={(e) => setStudyDaysTotal(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="10"
                      className="w-full px-3 py-2 text-base font-bold text-center rounded-lg border border-indigo-300 bg-white text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="text-xs text-indigo-900 leading-tight">
                    <p className="font-semibold text-[11px] text-indigo-950">
                      Días asignados para rendir exámenes o estudio
                    </p>
                    <p className="text-[11px] text-indigo-800 mt-0.5">
                      <strong>Nota:</strong> Estos días <span className="underline font-semibold">no restan</span> de las vacaciones anuales.
                    </p>
                  </div>
                </div>
                {errors.studyDaysTotal && (
                  <p className="text-xs text-rose-600 mt-1">{errors.studyDaysTotal}</p>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 bg-slate-100/80 p-2.5 rounded-lg border border-slate-200/80 flex items-center gap-2">
                <span className="text-slate-400">ℹ️</span>
                <span>Al no ser estudiante, no se le asignan días de estudio ni podrá solicitarlos en el calendario.</span>
              </div>
            )}
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
              {employeeToEdit ? 'Guardar Cambios' : 'Registrar Empleado'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
