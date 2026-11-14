import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { LEGAL_DETAILS } from "@/lib/legal";
import { publicMetadata } from "@/lib/seo";

const description = "How Eton Note handles Google account information, study notes, uploaded images, AI prompts, PDF exports, sharing, and deletion.";
export const metadata = publicMetadata({
    title: "Privacy Policy", description, path: "/privacy", draft: LEGAL_DETAILS.draft,
});

const sections: DocumentSection[] = [
    {
        id: "operator", title: "Who is responsible for your information",
        content: <>
            <p>This policy describes Eton Note, a study-note application operated from {LEGAL_DETAILS.country}. The operator details below must be completed before production publication.</p>
            <dl>
                <dt>Operator</dt><dd>{LEGAL_DETAILS.operator}</dd>
                <dt>Postal address</dt><dd>{LEGAL_DETAILS.address}, {LEGAL_DETAILS.country}</dd>
                <dt>Privacy contact</dt><dd>{LEGAL_DETAILS.privacyEmail}</dd>
            </dl>
            <p>For the status of these placeholders, see the <a href="/contact">Contact page</a>. This draft does not certify compliance with Nepal’s privacy laws or laws that may apply to a particular user.</p>
        </>,
    },
    {
        id: "information", title: "Information the service processes",
        content: <>
            <ul>
                <li><strong>Account and sign-in information.</strong> Google sign-in supplies account identifiers and profile information such as your name, email address, profile image, and email-verification status. Linked authentication records may include OAuth tokens and their expiry. Eton Note does not receive your Google password.</li>
                <li><strong>Your notebook.</strong> We store note titles, descriptions, blocks, text, code, formulas, tables, drawings, image references, subjects/folders, favorites, pinned status, sharing settings, and creation/update timestamps.</li>
                <li><strong>Uploaded media.</strong> Images you upload are sent to Cloudinary. The app stores or uses their URLs and associated identifiers.</li>
                <li><strong>AI requests.</strong> When you use AI Block Generator, the prompt you enter is sent to the configured external AI endpoint. The current integration does not automatically send the entire open note. Any personal information you put in the prompt is part of that request.</li>
                <li><strong>PDF requests.</strong> When you request an export, the configured PDF service can retrieve the saved note and export-related details through authorized, short-lived access. This can include the note’s content, images, subject, title, and author details used by the export flow.</li>
                <li><strong>Technical information.</strong> Authentication, hosting, and integrated providers may process IP addresses, request information, browser/device details, timestamps, and error or security logs needed to deliver and protect the service. Provider-specific logging and retention must be confirmed before release.</li>
            </ul>
            <p>Authentication cookies and browser-stored theme preferences are explained in the <a href="/cookies">Cookie Policy</a>.</p>
        </>,
    },
    {
        id: "purposes", title: "Why information is used",
        content: <>
            <p>Information is used to create and authenticate your account, save and organize your notes, apply your preferences, provide sharing you enable, and generate AI blocks or PDFs you request. It may also be used to diagnose failures, prevent misuse, respond to support requests, and meet applicable legal obligations.</p>
            <p><strong>No optional analytics, advertising, or marketing tracking is enabled in the current setup.</strong> A new processing purpose or optional tracking integration must be reviewed, disclosed, and supported by any consent required by applicable law before it is enabled.</p>
            <p>This draft does not authorize retaining identifiable names or email addresses solely for “insight” after account deletion. The intended approach is to retain only genuinely anonymous aggregate statistics for that purpose.</p>
        </>,
    },
    {
        id: "sharing", title: "Private notes, sharing, and image URLs",
        content: <>
            <p>Notes are private by default. You can explicitly enable a public, read-only link. In the current app, viewers must sign in to read a shared note; anyone with the link and an account may then be able to view it.</p>
            <p>Making a note private again stops shared access through the app. It cannot recall screenshots, downloaded PDFs, or copies that another person has already made. Only share material you have permission to disclose.</p>
            <p><strong>Uploaded image URLs are not protected by the note’s sign-in requirement.</strong> Someone who knows a direct Cloudinary URL may access that image. Do not use uploads for material that needs confidential storage.</p>
            <p>Note pages, including shared notes, are excluded from the public sitemap and marked not to be indexed. Search-engine instructions are not access controls, and not every crawler follows them.</p>
        </>,
    },
    {
        id: "providers", title: "Providers and external processing",
        content: <>
            <p>Eton Note relies on services that process information to provide the requested functionality:</p>
            <ul>
                <li><strong>Google:</strong> authentication and account profile information. See <a href="https://policies.google.com/privacy">Google’s Privacy Policy</a>.</li>
                <li><strong>Cloudinary:</strong> uploaded image storage and delivery. See <a href="https://cloudinary.com/privacy">Cloudinary’s Privacy Policy</a>.</li>
                <li><strong>Vercel:</strong> hosting of the public deployment. See <a href="https://vercel.com/legal/privacy-policy">Vercel’s Privacy Policy</a>.</li>
                <li><strong>Database hosting:</strong> [Database hosting provider and processing details].</li>
                <li><strong>AI processing:</strong> [AI service/provider, processing location, and retention terms].</li>
                <li><strong>PDF rendering:</strong> [PDF service operator/hosting provider and retention terms].</li>
            </ul>
            <p>Provider identities, contracts, processing locations, and retention settings that remain placeholders must be confirmed before launch. Do not assume an AI provider has a particular training or deletion policy that has not been verified.</p>
            <p>Providers may process data outside Nepal. The operator must review any required notices, consent, and safeguards for those transfers. Information may also be disclosed when required by applicable law or necessary to address unlawful misuse, with appropriate review.</p>
        </>,
    },
    {
        id: "retention", title: "Retention and deletion",
        content: <>
            <p>Account records and saved notebook content are retained while needed to provide your account and notes, subject to deletion and any lawful, documented retention requirement.</p>
            <p><strong>Note deletion is available now.</strong> Deleting a note removes its database record and associated note blocks. There are no application-managed backups at present, and the app does not offer restoration of deleted notes. Keep your own exports of material you need.</p>
            <p>Deleting a note does <strong>not</strong> currently delete its uploaded files from Cloudinary. Provider-side media cleanup must be addressed before promising complete image erasure. Copies held by recipients or other external services are not recalled by deleting the source note.</p>
            <p><strong>Account deletion from Settings is planned before production release and is not currently available.</strong> The intended production behavior is to delete profile identifiers, including name and email, linked login records, folders, and notes with the account. Any statistics kept for insight should be genuinely anonymous, not identifiable or reversibly pseudonymized user records.</p>
            <p>Any exceptional legal/security retention needs a documented reason and period. Operational log retention and third-party deletion timelines are not yet finalized; this draft does not promise a deletion deadline or certify provider erasure.</p>
        </>,
    },
    {
        id: "choices", title: "Your choices and requests",
        content: <>
            <ul>
                <li>Edit or delete your notes, and disable public sharing when it is no longer needed.</li>
                <li>Avoid including personal or confidential information in an AI prompt or an uploaded image.</li>
                <li>Sign out on shared devices and clear browser storage if you want to remove saved theme preferences.</li>
                <li>Manage Google permissions from your Google Account. Disconnecting Google does not itself delete Eton Note’s saved account or notebook records.</li>
            </ul>
            <p>Once a real privacy contact is published, you may request information, correction, or deletion and raise concerns as available under applicable law. Requests may require proportionate identity verification. The placeholder {LEGAL_DETAILS.privacyEmail} is not an active request channel.</p>
        </>,
    },
    {
        id: "security", title: "Security and sensitive information",
        content: <>
            <p>The application uses authenticated access and ownership checks for notebook operations. No online service can guarantee perfect security, uninterrupted access, or complete protection against loss.</p>
            <p>Eton Note does not promise end-to-end encryption. Avoid storing credentials, identity documents, medical records, or other material that requires a level of confidentiality this notebook does not provide.</p>
        </>,
    },
    {
        id: "younger-learners", title: "Younger learners",
        content: <>
            <p>Eton Note is intended for students and learners who can use the service under applicable law, with guardian permission where required. We do not intentionally seek children’s personal information without any consent required by law.</p>
            <p>Before production launch, the operator must confirm applicable minimum-age, guardian-consent, and child-data requirements. A real privacy contact must be available for a guardian to raise a concern.</p>
        </>,
    },
    {
        id: "updates", title: "Changes to this policy",
        content: <>
            <p>This page’s update date changes when the policy is materially revised. Material new uses of personal information require an updated notice and any consent or other steps required by applicable law, not merely an edit to this page.</p>
            <p>Read the <a href="/terms">Terms of Service</a> and <a href="/cookies">Cookie Policy</a> alongside this notice.</p>
        </>,
    },
];

export default function PrivacyPage() {
    return <PublicDocument title="Privacy Policy" description={description} path="/privacy" sections={sections}
        draft={LEGAL_DETAILS.draft} updatedAt={LEGAL_DETAILS.updatedAt}
        related={[{ href: "/cookies", label: "Cookie Policy" }, { href: "/terms", label: "Terms of Service" }, { href: "/contact", label: "Contact details" }]} />;
}
