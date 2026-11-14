import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { LEGAL_DETAILS } from "@/lib/legal";
import { publicMetadata } from "@/lib/seo";

const description = "Eton Note’s terms for accounts, content ownership, acceptable use, AI assistance, public sharing, PDF exports, availability, and Nepal jurisdiction.";
export const metadata = publicMetadata({
    title: "Terms of Service", description, path: "/terms", draft: LEGAL_DETAILS.draft,
});

const sections: DocumentSection[] = [
    {
        id: "agreement", title: "The service and these terms",
        content: <>
            <p>Eton Note is a block-based study notebook operated by {LEGAL_DETAILS.operator} in {LEGAL_DETAILS.country}. These terms describe the proposed agreement for using its website and application.</p>
            <p>Operator/contact information and legal review are incomplete. While the page is labeled a draft, it must not be presented as a finalized production agreement. The <a href="/privacy">Privacy Policy</a> and <a href="/cookies">Cookie Policy</a> explain the service’s current data practices.</p>
        </>,
    },
    {
        id: "accounts", title: "Eligibility and account responsibility",
        content: <>
            <p>You must be legally able to agree to the applicable terms, or have any guardian permission required by law. Google sign-in is the current account entry point, and use of Google is also subject to Google’s own terms.</p>
            <p>Keep your Google account secure, use accurate account information, and sign out on shared devices. Do not impersonate someone else, transfer another person’s credentials, or use an account you are not authorized to access.</p>
        </>,
    },
    {
        id: "ownership", title: "Your content and permissions",
        content: <>
            <p>You retain the rights you hold in the notes and material you create or upload. You are responsible for having permission to store, process, export, and share that material.</p>
            <p>You grant the operator the limited permission needed to host, store, display, and process your content to provide the service, including sharing you enable and AI/PDF operations you request. This is not a transfer of ownership of your notes.</p>
            <p>Rights in AI-generated material can depend on applicable law and provider terms. We do not guarantee that generated content is original, accurate, or free of third-party rights. The Eton Note name, branding, and software are not licensed to you beyond ordinary use of the service.</p>
        </>,
    },
    {
        id: "acceptable-use", title: "Acceptable use",
        content: <>
            <p>Do not use the service to:</p>
            <ul>
                <li>Store or share unlawful content, infringe copyright, or disclose someone’s personal information without appropriate authority.</li>
                <li>Harass, threaten, impersonate, or exploit other people.</li>
                <li>Upload malware, disrupt the service, send abusive automated requests, or evade access restrictions.</li>
                <li>Attempt to access another user’s private notes, credentials, or internal rendering endpoints without authorization.</li>
                <li>Use AI assistance or shared notes in ways that violate your school’s academic-integrity rules.</li>
            </ul>
        </>,
    },
    {
        id: "sharing", title: "Sharing and uploaded images",
        content: <>
            <p>Notes are private by default. Enabling public sharing allows signed-in users with the link to view the note in read-only mode. You are responsible for checking what you publish and who receives its link.</p>
            <p>Switching a note back to private does not recall screenshots, PDFs, or other copies already made. A shared link is not a confidentiality agreement.</p>
            <p>Cloudinary image URLs may be directly accessible to someone who knows them. Note deletion does not currently remove uploaded media from Cloudinary. Do not upload images that require private, access-controlled storage.</p>
        </>,
    },
    {
        id: "ai", title: "AI assistance and educational use",
        content: <>
            <p>AI Block Generator provides drafts based on the prompt you submit to the configured external endpoint. AI may produce incorrect explanations, fabricated facts, unsuitable code, or mistakes in equations.</p>
            <p>Review generated material against reliable course sources before relying on it. Eton Note is a study aid, not a substitute for professional advice, independent judgment, or your institution’s assessment requirements. Do not put confidential information in an AI prompt.</p>
        </>,
    },
    {
        id: "saving-deletion", title: "Saving, exports, and deletion",
        content: <>
            <p>Saving and autosave depend on successful requests and available network/service connections. Check the save status and keep your own exported copies of important material.</p>
            <p>PDF export uses an external rendering service. Exports may differ from the editing view, and you should review the downloaded PDF before printing or distributing it. The Eton Note watermark is currently always included.</p>
            <p>Users can delete notes now. There are no application-managed backups at present and no in-app restoration of deleted notes.</p>
            <p><strong>Account deletion from Settings is planned before production release, not currently available.</strong> The intended deletion of profile identifiers and associated notebook records is described in the <a href="/privacy#retention">Privacy Policy’s retention section</a>. It must be implemented before that production behavior is promised as available.</p>
        </>,
    },
    {
        id: "availability", title: "Availability, changes, and free entry",
        content: <>
            <p>Eton Note is currently free to start. This is not a promise that every future feature will remain free or that a particular free-tier limit will never change. Any future paid offering should disclose its terms before you choose to purchase it.</p>
            <p>Features may change, and maintenance, provider failures, or security incidents may interrupt access. We do not promise uninterrupted service, a recovery capability that does not exist, or a particular study outcome.</p>
            <p>The operator may restrict access to address unlawful use, security risks, or material breaches of the applicable terms, with notice where reasonably practicable and required by law. Any handling of retained data remains subject to the applicable privacy obligations.</p>
        </>,
    },
    {
        id: "limitations", title: "Disclaimers and limits",
        content: <>
            <p>To the extent allowed by applicable law, the service is provided “as is” and “as available,” without guarantees of accuracy, suitability for a particular purpose, or uninterrupted availability.</p>
            <p>To the extent allowed by applicable law, the operator is not responsible for indirect or consequential loss arising from use of the service, including reliance on unverified AI output or copies you choose to share. These limitations do not exclude liability or consumer rights that cannot lawfully be excluded.</p>
            <p>This draft’s disclaimer and limitation language requires local legal review. It is not a claim that every limitation is enforceable for every user.</p>
        </>,
    },
    {
        id: "law", title: "Governing law and disputes",
        content: <>
            <p>The intended governing jurisdiction is {LEGAL_DETAILS.country}. Subject to mandatory applicable law, these terms are intended to be governed by the laws of Nepal and disputes addressed by the competent courts of Nepal.</p>
            <p>Nothing in this draft removes rights or protections that apply mandatorily in another jurisdiction. The choice-of-law and dispute provisions must be reviewed before production publication.</p>
        </>,
    },
    {
        id: "contact-updates", title: "Contact, reports, and updates",
        content: <>
            <p>The intended support contact is {LEGAL_DETAILS.supportEmail}. It is currently a placeholder, not an active channel. Real contact details and any complaint process must be published before release.</p>
            <p>Once a contact is available, report a service issue or alleged rights violation with the relevant note/link and enough information to understand the concern. Do not send passwords, tokens, or unnecessary sensitive content.</p>
            <p>Material changes to finalized terms should be communicated as required by applicable law. The update date on this page is not a substitute for any notice or acceptance that is legally required.</p>
        </>,
    },
];

export default function TermsPage() {
    return <PublicDocument title="Terms of Service" description={description} path="/terms" sections={sections}
        draft={LEGAL_DETAILS.draft} updatedAt={LEGAL_DETAILS.updatedAt}
        related={[{ href: "/privacy", label: "Privacy Policy" }, { href: "/cookies", label: "Cookie Policy" }, { href: "/contact", label: "Contact details" }]} />;
}
