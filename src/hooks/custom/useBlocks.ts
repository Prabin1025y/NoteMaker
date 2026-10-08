import { fetchBlocksByNoteId } from "@/services/blockService";
import { useQuery } from "@tanstack/react-query";

export const blocksKeys = {
    all: ["blocks"] as const,

    lists: () => [...blocksKeys.all, "list"] as const,
    listByNoteId: (noteId: string) => [...blocksKeys.lists(), noteId] as const,
};

export function useGetBlocksByNoteId(noteId: string) {
    return useQuery({
        queryKey: blocksKeys.listByNoteId(noteId),
        queryFn: () => fetchBlocksByNoteId(noteId),
        staleTime: 5 * 60 * 1000,
    });
}
