import { getStateCodes as getDataConnectStateCodes } from '@dataconnect/generated';
import type { ApiResponse } from '../types';

export interface StateCode {
  code: string;
  name: string;
}

export async function getStateCodes(): Promise<ApiResponse<StateCode[]>> {
  try {
    const response = await getDataConnectStateCodes();
    const stateCodes = response.data.stateCodes.map((item) => ({
      code: (item.code || '').toUpperCase(),
      name: item.name || '',
    }));
    return { data: stateCodes, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load state codes';
    return { data: [], error: message };
  }
}
