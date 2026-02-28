import { apiClient } from '../lib/apiClient';
import type { ApiResponse } from '../types';

export interface StateCode {
  code: string;
  name: string;
}

export async function getStateCodes(): Promise<ApiResponse<StateCode[]>> {
  try {
    const response = await apiClient.get<{ state_codes: StateCode[] }>('/state-codes');
    const stateCodes = response.state_codes.map((item) => ({
      code: (item.code || '').toUpperCase(),
      name: item.name || '',
    }));
    return { data: stateCodes, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load state codes';
    return { data: [], error: message };
  }
}
