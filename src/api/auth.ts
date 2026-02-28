import { apiClient } from '../lib/apiClient';
import type { User, Session, AuthResponse, AuthError } from '../types';

export async function getSession(): Promise<User | null> {
  try {
    const response = await apiClient.get<{ user: User }>('/auth/session');
    return response.user;
  } catch (error) {
    return null;
  }
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const checkAuth = async () => {
    const user = await getSession();
    callback(user);
  };

  checkAuth();

  const interval = setInterval(checkAuth, 60000);

  return () => clearInterval(interval);
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<{ user: User; session: Session }>('/auth/signup', {
      email,
      password,
    });

    if (response.session) {
      apiClient.setToken(response.session.access_token);
    }

    return {
      user: response.user,
      session: response.session,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign up failed';
    const authError: AuthError = {
      message,
      code: message.includes('already registered') ? 'user_exists' : 'signup_error',
    };
    return {
      user: null,
      session: null,
      error: authError,
    };
  }
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<{ user: User; session: Session }>('/auth/login', {
      email,
      password,
    });

    if (response.session) {
      apiClient.setToken(response.session.access_token);
    }

    return {
      user: response.user,
      session: response.session,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign in failed';
    const authError: AuthError = { message };
    return {
      user: null,
      session: null,
      error: authError,
    };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    await apiClient.post('/auth/logout');
    apiClient.setToken(null);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign out failed';
    return { error: { message } };
  }
}

export async function resetPasswordForEmail(
  email: string,
  redirectTo: string | null = null
): Promise<{ error: AuthError | null }> {
  try {
    await apiClient.post('/auth/reset-password', {
      email,
      redirect_to: redirectTo,
    });
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password reset failed';
    return { error: { message } };
  }
}

export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    await apiClient.post('/auth/update-password', {
      password: newPassword,
    });
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password update failed';
    return { error: { message } };
  }
}
