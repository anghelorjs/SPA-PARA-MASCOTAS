// src/pages/admin/dashboard/services/admin.dashboard.service.ts
import api from '../../../../services/api';

export const adminDashboardService = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
};