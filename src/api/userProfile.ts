import {
  ensureUserProfile as ensureDataConnectUserProfile,
  getUserProfile as getDataConnectUserProfile,
} from '@dataconnect/generated';
import type { ApiResponse, UserProfile } from '../types';

interface EnsureUserProfileParams {
  userId: string;
  fullName?: string;
  phone?: string;
  role?: string;
}

const nullableText = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed || null;
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

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
    full_name: nullableText(fullName),
    phone: nullableText(phone),
  };

  try {
    await ensureDataConnectUserProfile({
      fullName: payload.full_name,
      phone: payload.phone,
      role,
    });
    return { data: payload, error: null };
  } catch (error) {
    return { error: errorMessage(error, 'Failed to create user profile') };
  }
}

export async function getUserProfile(
  userId: string
): Promise<ApiResponse<Pick<UserProfile, 'full_name'>>> {
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }

  try {
    const response = await getDataConnectUserProfile();
    return {
      data: { full_name: response.data.userProfile?.fullName ?? null },
      error: null,
    };
  } catch (error) {
    return { data: null, error: errorMessage(error, 'Failed to fetch user profile') };
  }
}
