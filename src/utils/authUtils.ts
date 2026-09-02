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

export function resetAdminPasswordToDefault(): void {
  localStorage.removeItem(ADMIN_PASSWORD_KEY);
  try {
    const stored = localStorage.getItem('obytkem_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.adminPassword = DEFAULT_ADMIN_PASSWORD;
      localStorage.setItem('obytkem_settings', JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
}

export function loginAdmin(password: string): boolean {
  if (!password) return false;
  const currentPassword = getAdminPassword();
  const input = password.trim();
  
  if (
    password === currentPassword || 
    input === currentPassword || 
    input === currentPassword.trim()
  ) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export async function loginAdminAsync(password: string): Promise<boolean> {
  if (!password) return false;
  const input = password.trim();

  // 1. Fetch fresh settings directly from database first (source of truth)
  try {
    const { dbService } = await import('../lib/supabase');
    const freshSettings = await dbService.getSettings();
    if (freshSettings.adminPassword && freshSettings.adminPassword.trim() !== '') {
      const dbPw = freshSettings.adminPassword.trim();
      setAdminPassword(dbPw);
      if (password === dbPw || input === dbPw) {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        return true;
      }
      return false;
    }
  } catch (err) {
    console.error('Error verifying admin password against database:', err);
  }

  // 2. Fallback to local storage password only if database unreachable
  return loginAdmin(password) || loginAdmin(input);
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
}
