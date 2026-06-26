import { apiFetch } from "@/lib/api-client";

export const createNote = async (title: string, description: string) => {
    try {
        const response = await apiFetch("http://localhost:3000/api/notes", {
            method: "POST",
            body: JSON.stringify({
                title,
                description,
            }),
        });

        const data = await response.json();

        return data;
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);

        alert("Unable to create Note");
    }
};

export const fetchNotes = async () => {
    try {
        const response = await apiFetch("http://localhost:3000/api/notes", {
            method: "GET",
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.message);

        return data;
    } catch (error) {
        if (process.env.NODE_ENV === "development") console.log(error);

        alert(
            error instanceof Error
                ? error.message
                : "Unable to fetch your notes",
        );
    }
};
