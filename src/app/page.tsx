"use client";
import AuthGate from "@/components/AuthGate";
import { useNoteStore } from "@/Context/DataStore";
import HomeLayout from "@/Pages/HomeLayout";
import { fetchNotes } from "@/services/noteService";
import { useEffect, useState } from "react";

export default function Home() {
    const [fetching, setFetching] = useState(true);
    const { setNotes } = useNoteStore();

    useEffect(() => {
        (async () => {
            const { notes, authorName } = await fetchNotes();

            if (notes && Array.isArray(notes)) {
                setNotes(
                    notes.map((n) => ({
                        id: n.id,
                        title: n.title,
                        blocksCount: n._count.blocks,
                        createdAt: n.createdAt,
                        updatedAt: n.updatedAt,
                        description: n.description,
                        authorName,
                        authorId: n.authorId,
                    })),
                );
                setFetching(false);
            }
        })();
    }, []);

    // if (fetching) return <div>fetching data...</div>;

    return (
        <AuthGate>
            <HomeLayout fetching={fetching} />
        </AuthGate>
    );
}
