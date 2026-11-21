export class ApiError extends Error {
    readonly status: number;
    readonly fieldErrors: Record<string, string>;

    constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
        super(message);
        this.name = 'apiError';
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}

interface ErrorBody {
    message?: string;
    fieldErrors?: Record<string, string>;
}

type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
    json?: unknown;
    body?: BodyInit;
    headers?: Record<string, string>;
};

const BASE_URL = "/api";

function defaultMessage(status: number): string {
    if (status === 401) return 'please sign-in to continue.';
    if (status === 413) return 'That file is too large. The file limit is 5MB.';
    if (status === 429) return "you've reached today limit. Try again tomorrow or upgrade";
    if (status >= 500) return "Something went wrong on our side. Please try again";
    return "The request could not be completed";
}

async function send(path: string, { json, body, headers, ...init }: RequestOptions): Promise<Response> {
    let res: Response;
    try {
        res = await fetch(BASE_URL + path, {
            credentials: 'include', //sends the session cookie once sign-in exists
            ...init,
            headers: {
                Accept: 'application/json',
                ...(json !== undefined ? { 'content-type': 'application/json' } : {}),
                ...headers,
            },
            body: json !== undefined ? JSON.stringify(json) : body,
        });
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') throw err;
        throw new ApiError(0, 'could not reach the server. Check your connection and try again.');
    }

    if (!res.ok) {
        let data: ErrorBody = {};
        try {
            data = (await res.json()) as ErrorBody;
        } catch {
            // Respone will not have any json body. Fall back to generic message.
        }
        throw new ApiError(res.status, data.message ?? defaultMessage(res.status), data.fieldErrors ?? {});
    }
    return res;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const res = await send(path, options);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
}

export async function requestBlob(path: string,
    options: RequestOptions = {}): Promise<{ blob: Blob; filename: string | null }> {
    const res = await send(path, { ...options, headers: { Accept: '*/* ', ...options.headers } });
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    return { blob: await res.blob(), filename: match ? decodeURIComponent(match[1]) : null };
}