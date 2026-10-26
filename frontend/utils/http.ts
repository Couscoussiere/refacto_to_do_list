export const GENERIC_ERROR_MESSAGE = 'Une erreur est survenue. Veuillez réessayer plus tard.';

// fetch lève une TypeError brute ("NetworkError…", "Failed to fetch") si le serveur est injoignable
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
        return await fetch(input, init);
    } catch {
        throw new Error(GENERIC_ERROR_MESSAGE);
    }
}

// Corps attendu en JSON : une réponse HTML/texte (proxy, CORS…) devient une erreur générique
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJson<T = any>(res: Response): Promise<T> {
    try {
        return await res.json();
    } catch {
        throw new Error(GENERIC_ERROR_MESSAGE);
    }
}

// Message à afficher pour une réponse en erreur : le "message" de l'API s'il existe,
// sinon le fallback de l'appel ; erreur serveur ou corps illisible → message générique
export async function getErrorMessage(res: Response, fallback: string): Promise<string> {
    if (res.status >= 500) return GENERIC_ERROR_MESSAGE;
    try {
        const body = await res.json();
        return typeof body?.message === 'string' && body.message ? body.message : fallback;
    } catch {
        return GENERIC_ERROR_MESSAGE;
    }
}
