// Security helper for Admin Portal authentication
const ADMIN_PASSWORD_KEY = 'admin_password';
const ADMIN_AUTH_KEY = 'admin_authenticated';
export const DEFAULT_ADMIN_PASSWORD = 'obytkem2026';

export function getAdminPassword(): string {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
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

export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
}
