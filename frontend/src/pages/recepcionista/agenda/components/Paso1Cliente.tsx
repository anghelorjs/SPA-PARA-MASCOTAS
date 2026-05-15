// src/pages/recepcionista/agenda/components/Paso1Cliente.tsx
import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, UserPlusIcon, PhoneIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { ClienteSearchResult } from '../services/recepcionista.agenda.service';

interface Paso1ClienteProps {
  clientes: ClienteSearchResult[];
  onBuscar: (search: string) => void;
  onSelectCliente: (cliente: ClienteSearchResult | null) => void;
  onNuevoCliente: () => void;
  selectedCliente: ClienteSearchResult | null;
  isLoading: boolean;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px 11px 40px',
  border: '1.5px solid #e2e8f0', borderRadius: 10,
  fontSize: 14, color: '#1e293b', outline: 'none',
  backgroundColor: '#f8fafc', boxSizing: 'border-box',
  fontFamily: 'inherit', transition: 'border-color 0.15s, background 0.15s',
};

export const Paso1Cliente = ({
  clientes, onBuscar, onSelectCliente, onNuevoCliente, selectedCliente, isLoading,
}: Paso1ClienteProps) => {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedCliente) inputRef.current?.focus();
  }, [selectedCliente]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.length >= 2) onBuscar(value);
  };

  const showDropdown = focused && search.length >= 2;

  /* ── Cliente ya seleccionado ── */
  if (selectedCliente) {
    return (
      <div>
        <div
          style={{
            border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '16px 18px',
            backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 14,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 18,
            }}
          >
            {selectedCliente.nombre.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2">
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                {selectedCliente.nombre}
              </p>
              <CheckCircleIcon style={{ width: 16, height: 16, color: '#16a34a' }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              {selectedCliente.telefono && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                  <PhoneIcon style={{ width: 12, height: 12 }} />
                  {selectedCliente.telefono}
                </span>
              )}
              {selectedCliente.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                  <EnvelopeIcon style={{ width: 12, height: 12 }} />
                  {selectedCliente.email}
                </span>
              )}
            </div>
            <span
              style={{
                display: 'inline-block', marginTop: 4, fontSize: 11,
                backgroundColor: '#dcfce7', color: '#15803d',
                padding: '1px 8px', borderRadius: 20, fontWeight: 600,
              }}
            >
              📱 {selectedCliente.canal_contacto || 'whatsapp'}
            </span>
          </div>
          <button
            onClick={() => { onSelectCliente(null); setSearch(''); }}
            style={{
              background: 'none', border: '1px solid #bbf7d0', borderRadius: 8,
              padding: '5px 12px', fontSize: 12, color: '#16a34a',
              cursor: 'pointer', fontWeight: 600, flexShrink: 0,
            }}
          >
            Cambiar
          </button>
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: '#22c55e', textAlign: 'center' }}>
          ✓ Cliente seleccionado. Haz clic en <strong>Siguiente</strong> para continuar.
        </p>
      </div>
    );
  }

  /* ── Búsqueda ── */
  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b' }}>
        Busca por nombre, teléfono o email del cliente.
      </p>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <MagnifyingGlassIcon
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 18, height: 18, color: focused ? '#2563eb' : '#9ca3af',
            pointerEvents: 'none', transition: 'color 0.15s',
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Nombre, teléfono o email..."
          style={{
            ...inputStyle,
            borderColor: focused ? '#2563eb' : '#e2e8f0',
            backgroundColor: focused ? '#fff' : '#f8fafc',
          }}
        />
        {isLoading && (
          <div
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              width: 16, height: 16, border: '2px solid #e2e8f0',
              borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }}
          />
        )}
      </div>

      {/* Resultados */}
      {showDropdown && clientes.length > 0 && (
        <div
          style={{
            border: '1.5px solid #e2e8f0', borderRadius: 12,
            overflow: 'hidden', maxHeight: 280, overflowY: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          {clientes.map((cliente, idx) => (
            <button
              key={cliente.id}
              onMouseDown={() => onSelectCliente(cliente)}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 16px',
                borderBottom: idx < clientes.length - 1 ? '1px solid #f1f5f9' : 'none',
                backgroundColor: '#fff', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 12, border: 'none', transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4f46e5', fontWeight: 700, fontSize: 15,
                }}
              >
                {cliente.nombre.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                  {cliente.nombre}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                  {[cliente.telefono, cliente.email].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, flexShrink: 0 }}>
                Seleccionar →
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {showDropdown && clientes.length === 0 && !isLoading && (
        <div
          style={{
            textAlign: 'center', padding: '28px 20px',
            border: '1.5px dashed #e2e8f0', borderRadius: 12,
            backgroundColor: '#fafafa',
          }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 14, color: '#475569', fontWeight: 600 }}>
            No se encontraron clientes
          </p>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#94a3b8' }}>
            "{search}" no coincide con ningún cliente registrado
          </p>
          <button
            onClick={onNuevoCliente}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            <UserPlusIcon style={{ width: 16, height: 16 }} />
            Crear nuevo cliente
          </button>
        </div>
      )}

      {/* Estado inicial */}
      {(!showDropdown || search.length < 2) && (
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <button
            onClick={onNuevoCliente}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 8, border: '1.5px dashed #cbd5e1',
              backgroundColor: '#fff', color: '#64748b', cursor: 'pointer',
              fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#2563eb';
              (e.currentTarget as HTMLElement).style.color = '#2563eb';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
              (e.currentTarget as HTMLElement).style.color = '#64748b';
            }}
          >
            <UserPlusIcon style={{ width: 14, height: 14 }} />
            O registrar nuevo cliente
          </button>
        </div>
      )}
    </div>
  );
};