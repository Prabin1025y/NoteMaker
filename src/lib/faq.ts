type Question = {
    question: string;
    answer: string;
    link?: { href: string; label: string };
};

export const FAQ_GROUPS: { id: string; title: string; questions: Question[] }[] = [
    {
        id: "getting-started", title: "Getting started",
        questions: [
            {
                question: "What is Eton Note?",
                answer: "Eton Note is a block-based study notebook. A single note can combine rich text, headings, LaTeX formulas, code, tables, images, dividers, and freehand drawings. You can rearrange those pieces as your understanding develops.",
                link: { href: "/features", label: "Explore the study-note features" },
            },
            {
                question: "Is Eton Note free?",
                answer: "Eton Note is currently free to start. No specific permanent free-tier limits or future pricing promises are being made here. If paid features are introduced, their terms should be shown before you choose to purchase them.",
            },
            {
                question: "Do I need an account or an installation?",
                answer: "The app runs in a web browser with JavaScript enabled. Google sign-in is currently required to create and manage notes. Reading an explicitly shared note also requires sign-in; there is no separate application installation required for the browser workflow.",
            },
            {
                question: "Can I organize notes by subject?",
                answer: "Yes. Notes belong to subjects/folders, and the dashboard provides search, favorites, and pinned notes. Inside the editor, you can move between notes in the same subject and use the block outline to find a section.",
                link: { href: "/guides/create-study-notes", label: "Learn how to organize study notes" },
            },
        ],
    },
    {
        id: "writing-saving", title: "Writing, AI, and saving",
        questions: [
            {
                question: "Can I write equations and code in my notes?",
                answer: "Yes. Use a formula block for LaTeX, or supported LaTeX notation inside rich text with $$…$$. Code blocks support language selection and syntax highlighting. Tables and drawings can sit beside your explanations in the same note.",
                link: { href: "/guides/math-and-code-notes", label: "Read the math and code guide" },
            },
            {
                question: "Does AI Block Generator automatically read my whole note?",
                answer: "No. The current integration sends the prompt you enter to the configured external AI endpoint, not automatically the entire open note or notebook. Generated blocks are drafts that you should check against reliable course materials. Anything you include in the prompt is sent as part of the request.",
            },
            {
                question: "Are changes saved automatically?",
                answer: "The editor supports autosave and manual saving. Saving still depends on a successful connection to the service, so check the save status before leaving or exporting. Keep your own PDF copies of important material; autosave is not a backup system.",
            },
            {
                question: "Can I restore a deleted note?",
                answer: "There are no application-managed backups or in-app restoration of deleted notes at present. Deleting a note removes its database record and associated blocks. Uploaded Cloudinary images are not currently deleted by the note-deletion action.",
                link: { href: "/privacy#retention", label: "Read the retention and deletion details" },
            },
        ],
    },
    {
        id: "sharing-privacy", title: "Sharing, PDFs, and privacy",
        questions: [
            {
                question: "Are my notes public by default?",
                answer: "No. Notes are private by default. The owner must explicitly enable public sharing. Shared viewers sign in and receive read-only access. Making a note private again stops shared access through the app, but cannot recall copies someone has already made.",
            },
            {
                question: "Can I download a PDF for offline revision?",
                answer: "Yes. PDF export creates a downloadable copy of your saved note using the configured rendering service. The export drawer lets you choose whether subject name, note title, author name, and page numbers appear. The Eton Note watermark is always included. A downloaded PDF can be read offline; this does not promise offline editing in the app.",
                link: { href: "/guides/export-and-share-notes", label: "Learn how to export and share" },
            },
            {
                question: "Are uploaded images private behind my note’s sign-in requirement?",
                answer: "No. The current Cloudinary upload URLs may be directly accessible to someone who knows the URL. A private note does not make its direct image URLs confidential. Avoid uploading images that need private, access-controlled storage.",
            },
            {
                question: "Can I delete my account from Settings?",
                answer: "Account deletion from Settings is planned before production release and is not currently available. The draft production approach is to delete profile identifiers and associated notebook records, retaining only genuinely anonymous aggregate statistics for insight where appropriate.",
                link: { href: "/privacy#retention", label: "Check the current deletion status" },
            },
            {
                question: "Does Eton Note use advertising or analytics trackers?",
                answer: "No optional analytics, advertising, or marketing tracking is enabled in the confirmed setup. The app uses authentication cookies and locally stored theme preferences. Google and other integrated providers have their own processing practices, described in the draft policies.",
                link: { href: "/cookies", label: "Read the Cookie Policy" },
            },
        ],
    },
];
