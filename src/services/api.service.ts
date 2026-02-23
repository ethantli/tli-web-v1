import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from '../config/firebase';
import {
  CaseSummary,
  CaseDetails,
  CreateCaseRequest,
  UpdateCaseRequest,
  ApiResponse
} from '../types/case.types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach Firebase auth token
    this.api.interceptors.request.use(
      async (config) => {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          console.error('Unauthorized - redirecting to login');
        } else if (error.response?.status === 403) {
          // Handle forbidden - show access denied message
          console.error('Access denied');
        }
        return Promise.reject(error);
      }
    );
  }

  // Get all cases for a user
  async getUserCases(userId: string): Promise<ApiResponse<CaseSummary[]>> {
    const response = await this.api.get(`/api/cases/user/${userId}`);
    return response.data;
  }

  // Get detailed information for a case
  async getCaseDetails(caseId: number): Promise<ApiResponse<CaseDetails>> {
    const response = await this.api.get(`/api/cases/${caseId}/details`);
    return response.data;
  }

  // Create a new case
  async createCase(data: CreateCaseRequest): Promise<ApiResponse<any>> {
    const response = await this.api.post('/api/cases/', data);
    return response.data;
  }

  // Update an existing case
  async updateCase(caseId: number, data: UpdateCaseRequest): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/api/cases/${caseId}`, data);
    return response.data;
  }
}

export const apiService = new ApiService();
