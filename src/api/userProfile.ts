import { apiClient } from '../lib/apiClient';
import type { UserProfile, ApiResponse } from '../types';

interface EnsureUserProfileParams {
  userId: string;
  fullName?: string;
  phone?: string;
  role?: string;
}

export async function ensureUserProfile({
  userId,
  fullName,
  phone,
  role = 'general',
}: EnsureUserProfileParams): Promise<{ data?: UserProfile; error: string | null }> {
  if (!userId) {
    return { error: 'User ID is required' };
  }

  const payload: UserProfile = {
    user_id: userId,
    role,
    full_name: fullName?.trim() || null,
    phone: phone?.trim() || null,
  };

  try {
    await apiClient.post('/user-profile', payload);
    return { data: payload, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user profile';
    return { error: message };
  }
}

export async function getUserProfile(
  userId: string
): Promise<ApiResponse<Pick<UserProfile, 'full_name'>>> {
  try {
    const response = await apiClient.get<Pick<UserProfile, 'full_name'>>(`/user-profile/${userId}`);
    return { data: response, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user profile';
    return { data: null, error: message };
  }
}
