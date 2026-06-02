// src/pages/admin/grooming/pages/GroomingAdmin.tsx
import { useState } from 'react';
import { ScissorsIcon, FolderIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { PestañaFichasHoy } from '../components/PestañaFichasHoy';
import { PestañaTodasFichas } from '../components/PestañaTodasFichas';
import { SubSeccionGaleria } from '../components/SubSeccionGaleria';

type TabType = 'hoy' | 'todas';

const TABS: { id: TabType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'hoy', label: 'Fichas de Hoy', icon: <ScissorsIcon className="h-4 w-4" />, description: 'Fichas del día actual' },
  { id: 'todas', label: 'Todas las Fichas', icon: <FolderIcon className="h-4 w-4" />, description: 'Historial completo' },
];

export const GroomingAdmin = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hoy');
  const [galeriaOpen, setGaleriaOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grooming</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestión de fichas de grooming y galería de fotos
            </p>
          </div>
          <button
            onClick={() => setGaleriaOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PhotoIcon className="h-4 w-4" />
            Ver Galería
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="hidden md:inline text-xs text-gray-400 ml-1">{tab.description}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="mt-4">
          {activeTab === 'hoy' && <PestañaFichasHoy />}
          {activeTab === 'todas' && <PestañaTodasFichas />}
        </div>
      </div>

      {/* Sub-sección Galería (modal a pantalla completa) */}
      {galeriaOpen && <SubSeccionGaleria onClose={() => setGaleriaOpen(false)} />}
    </>
  );
};