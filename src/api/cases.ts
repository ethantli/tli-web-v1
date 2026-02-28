import { apiClient } from '../lib/apiClient';
import type { CaseSummary, CaseDetails, ApiResponse } from '../types';

export async function getUserCases(userId: string): Promise<ApiResponse<CaseSummary[]>> {
  try {
    const response = await apiClient.get<{ cases: CaseSummary[] }>(`/cases/user/${userId}`);
    return {
      data: response.cases,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch cases';
    return {
      data: [],
      error: message,
    };
  }
}

export async function getCaseDetails(caseId: string): Promise<ApiResponse<CaseDetails>> {
  try {
    const response = await apiClient.get<CaseDetails>(`/cases/${caseId}`);
    return {
      data: response,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch case details';
    return {
      data: null,
      error: message,
    };
  }
}
