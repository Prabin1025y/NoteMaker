import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { GUIDES } from "@/lib/guides";
import { publicMetadata } from "@/lib/seo";

const guide = GUIDES.exportAndShare;
export const metadata = publicMetadata({ ...guide, article: true });

const sections: DocumentSection[] = [
    {
        id: "choose", title: "Choose between a copy and a live note",
        content: <>
            <p>A PDF is a snapshot of the saved note at export time. Use it for offline revision, printing, or handing someone a fixed copy. Later edits to the source note do not update PDFs that have already been downloaded.</p>
            <p>A public note link points to the note in the app. It currently requires the viewer to sign in and provides read-only access. Shared access can be disabled, but copies someone has already made cannot be recalled.</p>
            <p>Keep a note private when you do not need to share it. Downloading your own PDF does not require turning on public sharing.</p>
        </>,
    },
    {
        id: "save", title: "Save and preview before exporting",
        content: <>
            <ol>
                <li>Finish any block edits and use the editor’s <strong>Save</strong> control when needed.</li>
                <li>Check that saving has completed successfully. A pending or failed request is not confirmation that the latest version is stored.</li>
                <li>Open <strong>Preview</strong> and review headings, formulas, code, tables, images, and drawings.</li>
                <li>Make any corrections, then confirm those changes have saved too.</li>
            </ol>
            <p>The PDF service renders the saved note, so this check matters even when autosave is enabled. Network or provider failures can interrupt saving or exporting. Keep the editor open if you need to retry, rather than assuming an unsuccessful request finished in the background.</p>
        </>,
    },
    {
        id: "export", title: "Choose the PDF’s header and footer details",
        content: <>
            <p>Select <strong>Export</strong> to open the PDF export drawer. Choose which details to include:</p>
            <ul>
                <li><strong>Subject name:</strong> useful when several course notes are printed together.</li>
                <li><strong>Note title:</strong> identifies the topic of the exported pages.</li>
                <li><strong>Author name:</strong> include it only if it is appropriate for the recipients; it is not selected by default.</li>
                <li><strong>Page numbers:</strong> useful for keeping a printed note in order.</li>
            </ul>
            <p>The <strong>Eton Note watermark</strong> is always included and cannot be switched off in the current export flow. Select <strong>Download PDF</strong> and wait for the export to finish. The service retrieves the saved note through authorized access; private notes do not have to be published for export.</p>
            <p>Open the downloaded file and inspect it before printing or sending it. Check page breaks, cropped content, and the legibility of diagrams and code. A preview in the editor is not a substitute for reviewing the actual PDF.</p>
        </>,
    },
    {
        id: "share", title: "Enable a read-only link only when you need it",
        content: <>
            <ol>
                <li>Open <strong>Share</strong> in the note editor.</li>
                <li>Enable <strong>Public access</strong> and wait for the update to complete. If the update fails, do not rely on the new setting.</li>
                <li>Use <strong>Copy</strong> to copy the note link and send it to the intended recipients.</li>
                <li>Tell recipients that they must sign in to view it and that access is read-only.</li>
            </ol>
            <p>In the current app, public sharing is not a per-recipient invitation system. A signed-in person who receives the link may be able to view it. Review your note for personal information, confidential material, and content you do not have permission to distribute.</p>
            <p>Note pages are marked not to be indexed and are omitted from the public sitemap. That does not make a public link secret or guarantee that every crawler will obey those instructions.</p>
        </>,
    },
    {
        id: "revoke", title: "Understand what disabling access can and cannot do",
        content: <>
            <p>Turn <strong>Public access</strong> off when the app link is no longer needed, and confirm that the update succeeds. This stops shared access through Eton Note; it does not remove PDFs, screenshots, or copied text held by recipients.</p>
            <p>Uploaded Cloudinary image URLs can also remain directly accessible to someone who knows the URL. Deleting a note currently removes its database content, not its Cloudinary uploads. Do not assume deleting the source note erases every copy of its material.</p>
            <p>There are no application-managed backups at present. Keep your own PDF copies before deleting material you may need again. Review the <a href="/privacy#retention">draft retention and deletion information</a> for the current account-deletion status and remaining production requirements.</p>
        </>,
    },
];

export default function ExportAndShareGuide() {
    return <PublicDocument {...guide} sections={sections} schemaType="Article"
        breadcrumbs={[{ href: "/", label: "Home" }, { href: "/guides", label: "Study guides" }]}
        related={[{ href: GUIDES.studyNotes.path, label: "Organize study notes" }, { href: "/privacy", label: "Privacy Policy" }, { href: "/faq", label: "Frequently asked questions" }]} />;
}
