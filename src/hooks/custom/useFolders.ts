import { fetchFolders } from "@/services/folderService";
import { useQuery } from "@tanstack/react-query";

export const foldersKeys = {
    all: ["folders"] as const,

    lists: () => [...foldersKeys.all, "list"] as const,
    listAll: () => [...foldersKeys.lists(), "all"] as const,
};

export function useGetAllFolders() {
    return useQuery({
        queryKey: foldersKeys.listAll(),
        queryFn: fetchFolders,
        staleTime: 60 * 60 * 1000,
    });
}
