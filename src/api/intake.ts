import { apiClient } from '../lib/apiClient';
import type { Incident, Damages, CaseContact, Party, Document, ApiResponse } from '../types';

interface CreateCaseParams {
  userId: string;
  consentStore: boolean;
  consentContact: boolean;
}

export async function createCase({
  userId,
  consentStore,
  consentContact,
}: CreateCaseParams): Promise<ApiResponse<{ id: string }>> {
  try {
    const response = await apiClient.post<{ id: string }>('/cases', {
      user_id: userId,
      status: 'submitted',
      consent_store: consentStore,
      consent_contact: consentContact,
      consent_at: new Date().toISOString(),
    });
    return { data: response, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create case';
    return { data: null, error: message };
  }
}

export async function deleteCase(caseId: string): Promise<{ error: string | null }> {
  try {
    await apiClient.delete(`/cases/${caseId}`);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete case';
    return { error: message };
  }
}

export async function createIncident(incidentData: Incident): Promise<{ error: string | null }> {
  try {
    await apiClient.post('/incidents', incidentData);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create incident';
    return { error: message };
  }
}

export async function createDamages(damagesData: Damages): Promise<{ error: string | null }> {
  try {
    await apiClient.post('/damages', damagesData);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create damages';
    return { error: message };
  }
}

export async function createCaseContact(contactData: CaseContact): Promise<{ error: string | null }> {
  try {
    await apiClient.post('/case-contact', contactData);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create case contact';
    return { error: message };
  }
}

export async function createParties(partiesData: Party[]): Promise<{ error: string | null }> {
  try {
    await apiClient.post('/parties', { parties: partiesData });
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create parties';
    return { error: message };
  }
}

export async function createDocument(documentData: Document): Promise<{ error: string | null }> {
  try {
    await apiClient.post('/documents', documentData);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create document';
    return { error: message };
  }
}
