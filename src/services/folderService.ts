import { apiFetch } from "@/lib/api-client";
import { FolderOption } from "@/types/misc";

export const fetchFolders = async (): Promise<FolderOption[]> => {
    const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/folders`,
        {
            method: "GET",
        },
    );

    const { folders } = await response.json();

    return folders;
};

export type CreateFolderPayload = {
    name: string;
    color?: string;
    icon?: string;
};

export const createFolder = async (payload: CreateFolderPayload) => {
    const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/folders`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to create folder");
    }

    return data.folder;
};

export type UpdateFolderPayload = {
    name?: string;
    color?: string | null;
    icon?: string | null;
    isFavorite?: boolean;
};

export const updateFolder = async (id: string, patch: UpdateFolderPayload) => {
    const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/folders/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify(patch),
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to update folder");
    }

    return data.folder;
};

export const deleteFolder = async (id: string) => {
    const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/folders/${id}`,
        {
            method: "DELETE",
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to delete folder");
    }

    return true;
};
