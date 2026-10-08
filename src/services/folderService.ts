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
