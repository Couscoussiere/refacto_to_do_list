import { RegisterPayload } from '../interface/Auth/RegisterPayload';
import { LoginPayload } from '../interface/Auth/LoginPayload';
import { AuthResponse } from '../interface/Auth/AuthResponse';
import { getErrorMessage, readJson, safeFetch } from '../utils/http';

const AUTH_BASE = '/v1/auth';

type StoredUser = AuthResponse['user'];

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await safeFetch(`${AUTH_BASE}/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Erreur lors de l\'inscription'));
    }

    return readJson<AuthResponse>(response);
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await safeFetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Email ou mot de passe incorrect'));
    }

    return readJson<AuthResponse>(response);
}

export async function logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

export function saveUser(user: StoredUser): void {
    localStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): StoredUser | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
}

export function getToken(): string | null {
    return localStorage.getItem('token');
}

export function saveToken(token: string): void {
    localStorage.setItem('token', token);
}

// Lit le claim `exp` du JWT (sans vérifier la signature : c'est le rôle du back).
function isTokenExpired(token: string): boolean {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const { exp } = JSON.parse(atob(payload));
        return typeof exp === 'number' && exp * 1000 <= Date.now();
    } catch {
        return false;
    }
}

export function isAuthenticated(): boolean {
    const token = getToken();
    if (token === null) return false;
    if (isTokenExpired(token)) {
        logout();
        return false;
    }
    return true;
}

export function isAdmin(): boolean {
    return getUser()?.role === 'admin';
}