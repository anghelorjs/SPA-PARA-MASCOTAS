// src/services/auth/authService.ts
import api from '../api';
import type { 
  LoginData, 
  LoginResponse, 
  RegisterData, 
  RegisterResponse,
  User
} from '../types/auth';

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginData): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/login', credentials);
      const { token, user } = response.data.data;
      
      // Guardar token y datos en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.rol);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Credenciales incorrectas';
      throw new Error(message);
    }
  },

  /**
   * Registrar nuevo cliente
   */
  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/register', userData);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.rol);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessage = Object.values(errors).flat().join(', ');
        throw new Error(errorMessage);
      }
      const message = error.response?.data?.message || 'Error al registrar usuario';
      throw new Error(message);
    }
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
    }
  },

  /**
   * Obtener información del usuario autenticado
   */
  async getUser(): Promise<User> {
    try {
      const response = await api.get<{ success: boolean; data: User }>('/me');
      const user = response.data.data;
      
      localStorage.setItem('userRole', user.rol);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      const message = error.response?.data?.message || 'Error al obtener usuario';
      throw new Error(message);
    }
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña';
      throw new Error(message);
    }
  },

  /**
   * Obtener token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Obtener rol del usuario
   */
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  },

  /**
   * Obtener usuario almacenado
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Verificar si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Verificar si el token es válido
   */
  async checkAuth(): Promise<boolean> {
    try {
      await this.getUser();
      return true;
    } catch {
      return false;
    }
  },
};
