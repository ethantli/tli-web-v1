import { apiClient } from '../lib/apiClient';
import type { FileUploadParams, FileUploadResponse, SignedUrlResponse } from '../types';

export function generateFileUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function uploadFile({
  file,
  userId,
  caseId,
}: FileUploadParams): Promise<FileUploadResponse> {
  try {
    const response = await apiClient.uploadFile('/files/upload', file, {
      user_id: userId,
      case_id: caseId,
    });
    return { path: response.path, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    return { path: null, error: message };
  }
}

export async function removeFiles(paths: string[]): Promise<{ error: string | null }> {
  try {
    await apiClient.post('/files/delete', { paths });
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove files';
    return { error: message };
  }
}

export async function createSignedUrl(
  path: string,
  expiresIn: number = 60
): Promise<SignedUrlResponse> {
  try {
    const response = await apiClient.post<{ url: string }>('/files/signed-url', {
      path,
      expires_in: expiresIn,
    });
    return { url: response.url, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create signed URL';
    return { url: null, error: message };
  }
}
