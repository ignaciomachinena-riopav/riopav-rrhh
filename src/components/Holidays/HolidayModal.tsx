import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Tag, FileText } from 'lucide-react';
import { Holiday } from '../../types';

interface HolidayModalProps {
  isOpen: boolean;
  holidayToEdit?: Holiday | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (holiday: Holiday) => void;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({
  isOpen,
  holidayToEdit,
  defaultDate,
  onClose,
  onSave
}) => {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<Holiday['type']>('empresa');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (holidayToEdit) {
      setDate(holidayToEdit.date);
      setName(holidayToEdit.name);
      setType(holidayToEdit.type);
      setDescription(holidayToEdit.description || '');
    } else {
      setDate(defaultDate || new Date().toISOString().slice(0, 10));
      setName('');
      setType('empresa');
      setDescription('');
    }
    setError('');
  }, [holidayToEdit, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('Debe indicar la fecha del feriado.');
      return;
    }
    if (!name.trim()) {
      setError('Debe indicar el nombre o motivo del feriado.');
      return;
    }

    const holiday: Holiday = {
      id: holidayToEdit ? holidayToEdit.id : `hol-${Date.now()}`,
      date,
      name: name.trim(),
      type,
      description: description.trim()
    };

    onSave(holiday);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {holidayToEdit ? 'Editar Feriado / No Laborable' : 'Agregar Feriado al Calendario'}
              </h3>
              <p className="text-xs text-slate-500">
                Se computará como día no hábil en los reportes
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fecha del Feriado <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Feriado o Asueto <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Día del Empleado de Comercio / Asueto Institucional"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Feriado
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="nacional">Feriado Nacional Inamovible / Trasladable</option>
              <option value="puente">Feriado Puente Turístico</option>
              <option value="provincial">Feriado Provincial / Regional</option>
              <option value="empresa">Asueto de Empresa / Día Gremial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción u Observaciones
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional: información adicional para el equipo..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-sm hover:shadow cursor-pointer"
            >
              {holidayToEdit ? 'Guardar Cambios' : 'Agregar al Calendario'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
