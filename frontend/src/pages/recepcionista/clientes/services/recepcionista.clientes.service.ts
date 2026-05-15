// src/pages/recepcionista/clientes/services/recepcionista.clientes.service.ts
import api from '../../../../services/api';

export interface CreateClienteData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  canalContacto?: 'whatsapp' | 'telegram' | 'email' | 'sms';
}

export interface CreateMascotaData {
  idCliente: number;
  nombre: string;
  especie: string;
  raza?: string;
  pesoKg: number;
  fechaNacimiento?: string;
  temperamento?: string;
  alergias?: string[];
  vacunas?: string[];
}

export const recepcionistaClienteService = {
  async createCliente(data: CreateClienteData): Promise<any> {
    const response = await api.post('/recepcionista/clientes', data);
    return response.data.data;
  },

  async createMascota(data: CreateMascotaData): Promise<any> {
    const response = await api.post('/recepcionista/mascotas', data);
    return response.data.data;
  },
};