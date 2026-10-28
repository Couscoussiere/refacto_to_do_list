import { fetchWithAuth } from '../utils/fetchWithAuth';
import { getErrorMessage, readJson } from '../utils/http';
import type { User } from '../interface/Auth/User';

export type { User };
const AUTH_BASE = '/v1/auth';

export async function deleteMyAccount(): Promise<void> {
    const res = await fetchWithAuth(`${AUTH_BASE}/me`, { method: 'DELETE' });
    if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Erreur lors de la suppression du compte'));
    }
}

export async function getAllUsers(): Promise<User[]> {
    const res = await fetchWithAuth(`${AUTH_BASE}/users`);
    if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
    const data = await readJson(res);
    return data.users;
}

export async function deleteUser(id: number): Promise<void> {
    const res = await fetchWithAuth(`${AUTH_BASE}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Erreur lors de la suppression de l\'utilisateur'));
    }
}
