const DEFAULT_BASE = "http://localhost:4000";
const BASE = import.meta.env.VITE_API_BASE || DEFAULT_BASE;

export class ApiError extends Error {
    constructor(message: string, public status?: number, public details?: any) {
        super(message);
    }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            ...(opts.headers || {})
        }
    });

    const text = await res.text();
    const data = text ? safeJson(text) : null;

    if (!res.ok) {
        throw new ApiError(data?.error || `Request failed: ${res.status}`, res.status, data);
    }
    return data as T;
}

function safeJson(text: string) {
    try { return JSON.parse(text); } catch { return { raw: text }; }
}

export const api = {
    baseUrl: BASE,
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: any) => request<T>(path, { method: "POST", body: JSON.stringify(body) })
};
