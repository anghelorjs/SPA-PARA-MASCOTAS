// src/pages/admin/configuracion/usuarios/hooks/useUsuarios.ts
import { useState, useEffect, useCallback } from 'react';
import { adminUsuariosService } from '../services/admin.usuarios.service';
import type { Usuario, CreateUsuarioData, UpdateUsuarioData, Role } from '../services/admin.usuarios.service';
import { useToast } from '../../../../../hooks/useToast';

type UsuariosParams = NonNullable<Parameters<typeof adminUsuariosService.getUsuarios>[0]>;

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

// Mapeo de roles a nombres legibles
const roleDisplayNames: Record<string, string> = {
  administrador: 'Administrador',
  recepcionista: 'Recepcionista',
  groomer: 'Groomer',
  cliente: 'Cliente',
};

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [filtros, setFiltros] = useState({
    rol: '',
    activo: '',
    search: '',
  });
  const { showToast } = useToast();

  // Cargar roles
  const loadRoles = useCallback(async () => {
    try {
      const data = await adminUsuariosService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      console.error('Error loading roles:', error);
      setRoles([]);
      showToast(getErrorMessage(error, 'Error al cargar roles'), 'error');
    }
  }, [showToast]);

  // Cargar usuarios
  const loadUsuarios = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: UsuariosParams = { page: currentPage, per_page: 15 };
      if (filtros.rol) params.rol = filtros.rol;
      if (filtros.activo !== '') params.activo = filtros.activo === 'true';
      if (filtros.search) params.search = filtros.search;

      const response = await adminUsuariosService.getUsuarios(params);
      setUsuarios(response.data);
      setTotal(response.total);
      setCurrentPage(response.current_page);
      setLastPage(response.last_page);
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al cargar usuarios'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filtros, showToast]);

  // Crear usuario - Mensaje personalizado según el rol
  const createUsuario = async (data: CreateUsuarioData) => {
    try {
      const result = await adminUsuariosService.createUsuario(data);
      const roleName = roleDisplayNames[data.rol] || data.rol;
      const nombreCompleto = `${result.nombre} ${result.apellido}`;
      
      showToast(`✅ ${roleName} "${nombreCompleto}" creado exitosamente`, 'success');
      await loadUsuarios();
      return true;
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al crear usuario'), 'error');
      return false;
    }
  };

  // Actualizar usuario - Mensaje descriptivo de los campos modificados
  const updateUsuario = async (id: number, data: UpdateUsuarioData) => {
    try {
      const usuario = usuarios.find(u => u.idUsuario === id);
      const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : `ID: ${id}`;
      
      // Determinar qué campos se están actualizando
      const updates: string[] = [];
      if (data.nombre !== undefined) updates.push('nombre');
      if (data.apellido !== undefined) updates.push('apellido');
      if (data.telefono !== undefined) updates.push('teléfono');
      if (data.activo !== undefined) updates.push(data.activo ? 'activación' : 'desactivación');
      if (data.rol !== undefined) updates.push(`rol a ${roleDisplayNames[data.rol] || data.rol}`);
      if (data.especialidad !== undefined) updates.push('especialidad');
      if (data.maxServiciosSimultaneos !== undefined) updates.push('máx. servicios simultáneos');
      if (data.turno !== undefined) updates.push('turno');
      if (data.direccion !== undefined) updates.push('dirección');
      if (data.canalContacto !== undefined) updates.push('canal de contacto');

      await adminUsuariosService.updateUsuario(id, data);
      
      if (updates.length > 0) {
        showToast(`✏️ Usuario "${nombreCompleto}" actualizado (${updates.join(', ')})`, 'success');
      } else {
        showToast(`✏️ Usuario "${nombreCompleto}" actualizado correctamente`, 'success');
      }
      
      await loadUsuarios();
      return true;
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al actualizar usuario'), 'error');
      return false;
    }
  };

  // Resetear contraseña - Muestra la nueva contraseña
  const resetPassword = async (id: number, newPassword: string) => {
    try {
      const usuario = usuarios.find(u => u.idUsuario === id);
      const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : `ID: ${id}`;
      
      await adminUsuariosService.resetPassword(id, { new_password: newPassword });
      showToast(`🔑 Contraseña restablecida para "${nombreCompleto}". Nueva contraseña: ${newPassword}`, 'success');
      return true;
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al restablecer contraseña'), 'error');
      return false;
    }
  };

  // Desactivar/Activar usuario - Mensaje según el estado actual
  const deleteUsuario = async (id: number) => {
    try {
      const usuario = usuarios.find(u => u.idUsuario === id);
      const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : `ID: ${id}`;
      const estadoActual = usuario?.activo;
      
      await adminUsuariosService.deleteUsuario(id);
      
      if (estadoActual) {
        showToast(`⛔ Usuario "${nombreCompleto}" ha sido desactivado`, 'warning');
      } else {
        showToast(`✅ Usuario "${nombreCompleto}" ha sido activado`, 'success');
      }
      
      await loadUsuarios();
      return true;
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Error al cambiar estado del usuario'), 'error');
      return false;
    }
  };

  // Cambiar página
  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  // Cambiar filtros
  const changeFiltros = (newFiltros: Partial<typeof filtros>) => {
    setFiltros(prev => ({ ...prev, ...newFiltros }));
    setCurrentPage(1);
  };

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  return {
    usuarios,
    isLoading,
    total,
    currentPage,
    lastPage,
    roles,
    filtros,
    createUsuario,
    updateUsuario,
    resetPassword,
    deleteUsuario,
    changePage,
    changeFiltros,
    loadUsuarios,
  };
};