"use client";
import { useNoteStore } from "@/Context/DataStore";
import HomeLayout from "@/Pages/HomeLayout";
import { useEffect } from "react";

export default function Home() {
    const { LoadNotesFromLocalStorage } = useNoteStore();

    useEffect(() => {
        LoadNotesFromLocalStorage();
    }, []);

    return <HomeLayout />;
}
