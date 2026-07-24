import { apiFetch } from "@/lib/api-client";

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
