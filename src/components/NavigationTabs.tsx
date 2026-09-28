import React from 'react';
import { Calendar, Users, FileText, Sun, FileSpreadsheet } from 'lucide-react';

export type MainTab = 'calendario' | 'empleados' | 'licencias' | 'feriados' | 'excel';

interface NavigationTabsProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  employeeCount: number;
  leaveCount: number;
  holidayCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  employeeCount,
  leaveCount,
  holidayCount
}) => {
  const tabs = [
    {
      id: 'calendario' as MainTab,
      label: 'Calendario y Ausencias',
      icon: Calendar,
      badge: null
    },
    {
      id: 'empleados' as MainTab,
      label: 'Nómina de Empleados',
      icon: Users,
      badge: employeeCount
    },
    {
      id: 'licencias' as MainTab,
      label: 'Registro de Licencias & Estudios',
      icon: FileText,
      badge: leaveCount
    },
    {
      id: 'feriados' as MainTab,
      label: 'Feriados y Asuetos',
      icon: Sun,
      badge: holidayCount
    },
    {
      id: 'excel' as MainTab,
      label: 'Reportes & Exportación Excel',
      icon: FileSpreadsheet,
      badge: 'XLSX'
    }
  ];

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 px-1 border-b-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : typeof tab.badge === 'string'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
