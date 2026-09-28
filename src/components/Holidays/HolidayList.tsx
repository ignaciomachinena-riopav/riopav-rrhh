import React from 'react';
import { Calendar, Plus, RefreshCw, Trash2, Edit, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Holiday } from '../../types';
import { formatDateSpanish } from '../../utils/dateUtils';

interface HolidayListProps {
  holidays: Holiday[];
  onOpenHolidayModal: () => void;
  onEditHoliday: (holiday: Holiday) => void;
  onDeleteHoliday: (holidayId: string) => void;
  onRestoreOfficialHolidays: () => void;
}

export const HolidayList: React.FC<HolidayListProps> = ({
  holidays,
  onOpenHolidayModal,
  onEditHoliday,
  onDeleteHoliday,
  onRestoreOfficialHolidays
}) => {
  // Ordenar por fecha ascendente
  const sortedHolidays = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      
      {/* Header de Gestión */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Feriados Nacionales Argentinos ({holidays.length})
            </h2>
            <span className="text-[11px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
              🇦🇷 Calendario Oficial
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Solo se computan feriados argentinos. No descuentan de las vacaciones anuales y se omiten del conteo hábil (Lun-Vie). Puede cargar nuevos feriados a mano.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRestoreOfficialHolidays}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            title="Restablecer los feriados oficiales nacionales argentinos de 2026"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Restablecer Oficiales 2026</span>
          </button>

          <button
            onClick={onOpenHolidayModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cargar Feriado Manual</span>
          </button>
        </div>
      </div>

      {/* Grid de Feriados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedHolidays.map(hol => {
          const typeLabel = 
            hol.type === 'nacional' ? 'Feriado Nacional' : 
            hol.type === 'puente' ? 'Puente Turístico' : 
            hol.type === 'provincial' ? 'Provincial' : 'Asueto Empresa';

          return (
            <div 
              key={hol.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-amber-300 transition shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xl">🏖️</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    hol.type === 'nacional' 
                      ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                      : hol.type === 'puente'
                        ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}>
                    {typeLabel}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{hol.name}</h3>
                <p className="text-xs font-semibold text-indigo-600 mb-1">
                  {formatDateSpanish(hol.date, true)}
                </p>
                {hol.description && (
                  <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                    {hol.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-3">
                <span className="font-mono text-[11px]">{hol.date}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditHoliday(hol)}
                    className="p-1 hover:text-indigo-600 rounded transition cursor-pointer"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteHoliday(hol.id)}
                    className="p-1 hover:text-rose-600 rounded transition cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
