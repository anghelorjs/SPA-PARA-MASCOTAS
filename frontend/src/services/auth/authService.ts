// src/services/auth/authService.ts
import api from '../api';
import type { 
  LoginData, 
  LoginResponseData,
  RegisterData, 
  RegisterResponse,
  User
} from '../types/auth';

export interface ForceChangePasswordResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: string;
  };
}

export interface ActivateAccountResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    message: string;
  };
}

export interface GoogleLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
}

export const authService = {
  async login(credentials: LoginData): Promise<LoginResponseData> {
    try {
      const response = await api.post<LoginResponse>('/login', credentials);
      const { token, user, must_change_password } = response.data.data;
      
      // Guardar token y datos en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.rol);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Retornar los datos que necesita el frontend
      return {
        user,
        token,
        must_change_password: must_change_password || false,
        token_type: 'Bearer',
        perfil: response.data.data.perfil
      };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Credenciales incorrectas';
      throw new Error(message);
    }
  },

  async loginWithGoogle(): Promise<void> {
    try {
      const response = await api.get('/auth/google');
      const { url } = response.data.data;
      // Redirigir a Google
      window.location.href = url;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar con Google';
      throw new Error(message);
    }
  },

  async handleGoogleCallback(token: string, userData: any): Promise<User> {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userData.rol);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  },

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

  async forceChangePassword(newPassword: string): Promise<{ token: string; token_type: string }> {
    try {
      const response = await api.post<ForceChangePasswordResponse>('/force-change-password', {
        new_password: newPassword,
      });
      const { token, token_type } = response.data.data;
      localStorage.setItem('token', token);
      return { token, token_type };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cambiar la contraseña';
      throw new Error(message);
    }
  },

  async activateAccount(token: string): Promise<{ email: string; message: string }> {
    try {
      const response = await api.post<ActivateAccountResponse>('/activate-account', { token });
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al activar la cuenta';
      throw new Error(message);
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async checkAuth(): Promise<boolean> {
    try {
      await this.getUser();
      return true;
    } catch {
      return false;
    }
  },
};
