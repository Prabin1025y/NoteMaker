import {
    createNote,
    deleteNote,
    fetchNoteById,
    fetchNotes,
    fetchNotesInFolderOfNote,
    updateNote,
} from "@/services/noteService";
import { NoteType } from "@/types/custom/notes";
import { handleApiError } from "@/utils/handleApiError";
import {
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export const notesKeys = {
    all: ["notes"] as const,

    lists: () => [...notesKeys.all, "list"] as const,
    allList: () => [...notesKeys.lists(), "all"] as const,
    folderNotes: () => [...notesKeys.lists(), "folder"] as const,
    notesInFolderOfNote: (noteId: string) =>
        [...notesKeys.folderNotes(), noteId] as const,

    noteByIds: () => [...notesKeys.all, "id"] as const,
    noteById: (noteId: string) => [...notesKeys.noteByIds(), noteId] as const,
};

export function useGetAllNotes(
    options?: Omit<UseQueryOptions<NoteType[]>, "queryKey" | "queryFn">,
) {
    return useQuery({
        queryKey: notesKeys.allList(),
        queryFn: fetchNotes,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

export function useGetNotesInFolderOfNote(
    noteId: string,
    options?: Omit<UseQueryOptions<NoteType[]>, "queryKey" | "queryFn">,
) {
    return useQuery({
        queryKey: notesKeys.notesInFolderOfNote(noteId),
        queryFn: () => fetchNotesInFolderOfNote(noteId),
        staleTime: 5 * 60 * 1000,
        enabled: Boolean(noteId),
        ...options,
    });
}

export function useCreateNote() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: createNote,

        onMutate: () => {
            if (!session) throw new Error("Please sign in first!!");
        },

        onError: (error) => {
            toast.error(handleApiError(error));
        },

        onSuccess: (data, newNote) => {
            toast.success("Note Created. Opening the note");
            queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
            if (newNote.folderOptions?.isNewFolder)
                queryClient.invalidateQueries({ queryKey: ["folders"] });
        },
    });
}

export function useUpdateNote() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: updateNote,

        onMutate: async (updateData) => {
            if (!session) throw new Error("Please sign in first!!");

            await queryClient.cancelQueries({ queryKey: notesKeys.allList() });

            const previousNotes = queryClient.getQueriesData({
                queryKey: notesKeys.allList(),
            });

            //Optimistic
            queryClient.setQueriesData<NoteType[]>(
                { queryKey: notesKeys.allList() },
                (old) => {
                    if (!old) return old;

                    return old.map((note) =>
                        note.id === updateData.id
                            ? {
                                  ...note,
                                  ...updateData.patch,
                                  updatedAt: new Date(),
                              }
                            : note,
                    );
                },
            );
            return { previousNotes };
        },

        onError: (error, _noteId, context) => {
            if (context?.previousNotes) {
                context.previousNotes.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error(handleApiError(error));
        },

        onSettled: () => {
            if (queryClient.isMutating() === 1)
                queryClient.invalidateQueries({
                    queryKey: notesKeys.lists(),
                });
        },
    });
}

export function useDeleteNote() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: deleteNote,

        onMutate: async (noteId: string) => {
            if (!session) throw new Error("Please sign in first!!");

            await queryClient.cancelQueries({ queryKey: notesKeys.allList() });

            const previousNotes = queryClient.getQueriesData({
                queryKey: notesKeys.allList(),
            });

            //Optimistically delete note
            queryClient.setQueriesData<NoteType[]>(
                { queryKey: notesKeys.allList() },
                (old) => {
                    if (!old) return old;

                    return old.filter((note) => note.id !== noteId);
                },
            );
            return { previousNotes };
        },

        onError: (error, _noteId, context) => {
            if (context?.previousNotes) {
                context.previousNotes.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error(handleApiError(error));
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: notesKeys.lists(),
            });
        },
    });
}

export function useGetNoteById(
    noteId: string,
    options?: Omit<
        UseQueryOptions<Awaited<ReturnType<typeof fetchNoteById>>>,
        "queryKey" | "queryFn"
    >,
) {
    return useQuery({
        queryKey: notesKeys.noteById(noteId),
        queryFn: async () => await fetchNoteById(noteId),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}
