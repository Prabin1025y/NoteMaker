let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.ok)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
    let response = await fetch(input, {
        ...init,
        credentials: "include",
    });

    if (response.status !== 401) return response;

    const refreshed = await refreshAccessToken();

    if (!refreshed) {
        window.location.href = "/auth/login";
        throw new Error("Session Expired");
    }

    response = await fetch(input, {
        ...init,
        credentials: "include",
    });

    return response;
}
