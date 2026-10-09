import { fetchBlocksByNoteId } from "@/services/blockService";
import { NoteBlockType } from "@/types/custom/block";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const blocksKeys = {
    all: ["blocks"] as const,

    lists: () => [...blocksKeys.all, "list"] as const,
    listByNoteId: (noteId: string) => [...blocksKeys.all, noteId] as const,
};

export function useGetBlocksByNoteId(
    noteId: string,
    options?: Omit<
        UseQueryOptions<NoteBlockType[]>,
        "queryKey" | "queryFn"
    >,
) {
    return useQuery({
        queryKey: blocksKeys.listByNoteId(noteId),
        queryFn: () => fetchBlocksByNoteId(noteId),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}
