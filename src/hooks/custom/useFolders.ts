import {
    createFolder,
    deleteFolder,
    fetchFolders,
    updateFolder,
    UpdateFolderPayload,
} from "@/services/folderService";
import { handleApiError } from "@/utils/handleApiError";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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

export function useCreateFolder() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: createFolder,

        onMutate: () => {
            if (!session) throw new Error("Please sign in first!!");
        },

        onError: (error) => {
            toast.error(handleApiError(error));
        },

        onSuccess: () => {
            toast.success("Folder created");
            queryClient.invalidateQueries({ queryKey: foldersKeys.all });
        },
    });
}

export function useUpdateFolder() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: ({
            id,
            patch,
        }: {
            id: string;
            patch: UpdateFolderPayload;
        }) => updateFolder(id, patch),

        onMutate: () => {
            if (!session) throw new Error("Please sign in first!!");
        },

        onError: (error) => {
            toast.error(handleApiError(error));
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: foldersKeys.all });
        },
    });
}

export function useDeleteFolder() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: deleteFolder,

        onMutate: () => {
            if (!session) throw new Error("Please sign in first!!");
        },

        onError: (error) => {
            toast.error(handleApiError(error));
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: foldersKeys.all });
        },
    });
}
