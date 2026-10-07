export const handleApiError = (error: unknown): string => {
    if (error instanceof Error)
        return error.message || "An unexpected error occurred";
    return "An unexpected error occurred";
};
