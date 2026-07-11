export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
    const response = await fetch(input, {
        ...init,
        credentials: "include",
    });

    return response;
}
