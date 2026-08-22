import { apiFetch } from "@/lib/api-client";
import type { NoteType } from "@/types/dataSotoreTypes";

type CreateNoteFolderOptions = {
    isNewFolder: boolean;
    folderId?: string;
    folderName?: string;
};

export const createNote = async (
    title: string,
    description: string,
    folderOptions?: CreateNoteFolderOptions,
) => {
    try {
        const payload = {
            title,
            description,
            ...(folderOptions ? folderOptions : {}),
        };

        const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/notes`,
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to create Note");
        }

        return data;
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);

        alert(error instanceof Error ? error.message : "Unable to create Note");
    }
};

export const fetchFolders = async () => {
    try {
        const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/folders`,
            {
                method: "GET",
            },
        );

        const { folders } = await response.json();

        return folders;
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);

        alert(
            error instanceof Error
                ? error.message
                : "Unable to fetch your folders",
        );
    }
};

export const fetchNotes = async () => {
    try {
        const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/notes`,
            {
                method: "GET",
            },
        );

        const { notes, authorName } = await response.json();

        return notes.map((n: any) => ({
            id: n.id,
            title: n.title,
            blocksCount: n._count.blocks,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
            description: n.description,
            folderId: n.folderId,
            authorName,
            authorId: n.authorId,
            isFavorite: Boolean(n.isFavorite),
            isPinned: Boolean(n.isPinned),
            isPublic: Boolean(n.isPublic),
        }));
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);

        alert(
            error instanceof Error
                ? error.message
                : "Unable to fetch your notes",
        );
    }
};

// Fetch a single note by id. Succeeds when the current user owns the note OR
// the note is public. Returns the mapped note plus whether the viewer owns it.
// Returns null when the note is not accessible (caller handles "not found").
export const fetchNoteById = async (
    id: string,
): Promise<{ note: NoteType; isOwner: boolean } | null> => {
    const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/notes/${id}`,
        {
            method: "GET",
        },
    );

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 404 || response.status === 403) return null;
        throw new Error(data.message || "Unable to load note");
    }

    const n = data.note;
    const note: NoteType = {
        id: n.id,
        title: n.title,
        blocksCount: n._count?.blocks ?? 0,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        description: n.description,
        folderId: n.folderId,
        authorName: n.author?.name ?? "",
        authorId: n.authorId,
        isFavorite: Boolean(n.isFavorite),
        isPinned: Boolean(n.isPinned),
        isPublic: Boolean(n.isPublic),
    };

    return { note, isOwner: Boolean(data.isOwner) };
};

export const fetchBlocks = async (noteId: string) => {
    try {
        const res = await apiFetch(
            `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/blocks?noteId=${noteId}`,
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        return data.blocks;
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);

        alert(
            error instanceof Error
                ? error.message
                : "Error while fetching data",
        );
    }
};

// ---- Metadata mutations (favorite / pin / rename / move / folders) ----
// These intentionally THROW on failure so React Query mutations can surface
// errors via onError (toasts) and roll back optimistic updates.

export type UpdateNotePayload = {
    title?: string;
    description?: string;
    isFavorite?: boolean;
    isPinned?: boolean;
    isPublic?: boolean;
    folderId?: string;
};

export const updateNote = async (id: string, patch: UpdateNotePayload) => {
    const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/notes/${id}`,
        {
            method: "PATCH",
            body: JSON.stringify(patch),
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to update note");
    }

    return data.note;
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
