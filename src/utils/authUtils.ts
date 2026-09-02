// Security helper for Admin Portal authentication
const ADMIN_PASSWORD_KEY = 'admin_password';
const ADMIN_AUTH_KEY = 'admin_authenticated';
export const DEFAULT_ADMIN_PASSWORD = 'obytkem2026';

export function getAdminPassword(): string {
  const localPw = localStorage.getItem(ADMIN_PASSWORD_KEY);
  if (localPw && localPw.trim() !== '') {
    return localPw;
  }

  try {
    const stored = localStorage.getItem('obytkem_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.adminPassword && typeof parsed.adminPassword === 'string' && parsed.adminPassword.trim() !== '') {
        return parsed.adminPassword;
      }
    }
  } catch {
    // ignore
  }

  return DEFAULT_ADMIN_PASSWORD;
}

export function setAdminPassword(newPassword: string): void {
  if (!newPassword) return;
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);

  try {
    const stored = localStorage.getItem('obytkem_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.adminPassword = newPassword;
      localStorage.setItem('obytkem_settings', JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
}

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function loginAdmin(password: string): boolean {
  const currentPassword = getAdminPassword();
  if (password === currentPassword) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export async function loginAdminAsync(password: string): Promise<boolean> {
  // 1. Check local password immediately
  if (loginAdmin(password)) {
    return true;
  }

  // 2. Fetch fresh settings from database in case password was changed on another device (e.g. PC)
  try {
    const { dbService } = await import('../lib/supabase');
    const freshSettings = await dbService.getSettings();
    if (freshSettings.adminPassword && freshSettings.adminPassword.trim() !== '') {
      setAdminPassword(freshSettings.adminPassword);
      if (password === freshSettings.adminPassword) {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        return true;
      }
    }
  } catch (err) {
    console.error('Error verifying admin password against database:', err);
  }

  return false;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
}
