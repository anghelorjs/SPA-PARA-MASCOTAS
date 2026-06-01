// src/pages/admin/reportes/pages/ReportesAdmin.tsx
import { useState, type ReactNode } from 'react';
import {
  CalendarIcon,
  ChartBarSquareIcon,
  CurrencyDollarIcon,
  CubeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { PestañaAgenda } from '../components/PestañaAgenda';
import { PestañaIngresos } from '../components/PestañaIngresos';
import { PestañaInventario } from '../components/PestañaInventario';
import { PestañaClientes } from '../components/PestañaClientes';

type TabType = 'agenda' | 'ingresos' | 'inventario' | 'clientes';

const TABS: { id: TabType; label: string; icon: ReactNode; description: string }[] = [
  {
    id: 'agenda',
    label: 'Agenda',
    icon: <CalendarIcon className="h-4 w-4 shrink-0" />,
    description: 'Citas por dia, groomer y servicio',
  },
  {
    id: 'ingresos',
    label: 'Ingresos',
    icon: <CurrencyDollarIcon className="h-4 w-4 shrink-0" />,
    description: 'Ventas, tickets y medios de pago',
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: <CubeIcon className="h-4 w-4 shrink-0" />,
    description: 'Stock critico, insumos y movimientos',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: <UserGroupIcon className="h-4 w-4 shrink-0" />,
    description: 'Clientes, mascotas e inactividad',
  },
];

export const ReportesAdmin = () => {
  const [activeTab, setActiveTab] = useState<TabType>('agenda');
  const activeTabInfo = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ChartBarSquareIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Reportes</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Analiza la operacion por agenda, ingresos, inventario y clientes desde una sola vista.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 sm:flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-all sm:min-w-[118px] ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                }`}
                title={tab.description}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-900">{activeTabInfo.label}</p>
          <p className="mt-0.5 text-sm text-blue-700">{activeTabInfo.description}</p>
        </div>
      </section>

      <section>{activeTab === 'agenda' && <PestañaAgenda />}</section>
      <section>{activeTab === 'ingresos' && <PestañaIngresos />}</section>
      <section>{activeTab === 'inventario' && <PestañaInventario />}</section>
      <section>{activeTab === 'clientes' && <PestañaClientes />}</section>
    </div>
  );
};
