import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { LEGAL_DETAILS } from "@/lib/legal";
import { publicMetadata } from "@/lib/seo";

const description = "Operator, support, and privacy-contact details for Eton Note in Nepal. Contact information remains a draft until real details are published.";
export const metadata = publicMetadata({ title: "Contact", description, path: "/contact", draft: LEGAL_DETAILS.draft });

const sections: DocumentSection[] = [
    {
        id: "details", title: "Operator and contact details",
        content: <>
            <dl>
                <dt>Operator</dt><dd>{LEGAL_DETAILS.operator}</dd>
                <dt>Jurisdiction</dt><dd>{LEGAL_DETAILS.country}</dd>
                <dt>Postal address</dt><dd>{LEGAL_DETAILS.address}</dd>
                <dt>Support</dt><dd>{LEGAL_DETAILS.supportEmail}</dd>
                <dt>Privacy requests</dt><dd>{LEGAL_DETAILS.privacyEmail}</dd>
            </dl>
            <p><strong>These are placeholders, not monitored email addresses.</strong> Real contact channels must be published before production release. No form on this page collects or submits your information.</p>
        </>,
    },
    {
        id: "help", title: "Finding help with a note",
        content: <>
            <p>The <a href="/faq">FAQ</a> answers common questions about saving, AI, privacy, and exports. The <a href="/guides">study guides</a> explain how to organize a note, combine math and code, and prepare a PDF or sharing link.</p>
            <p>When a support channel is available, include a description of the problem, what you expected, and your browser/device. Do not send passwords, authentication tokens, or unnecessary personal or confidential note content.</p>
        </>,
    },
    {
        id: "privacy-requests", title: "Privacy and deletion requests",
        content: <>
            <p>Review the <a href="/privacy#retention">current retention and deletion details</a> first. Users can delete notes now; account deletion from Settings is planned and not currently available.</p>
            <p>Once the privacy contact is published, it will be the intended place to raise a privacy concern or a request under applicable law. This draft does not promise an unimplemented request process or a response deadline.</p>
        </>,
    },
];

export default function ContactPage() {
    return <PublicDocument title="Contact" description={description} path="/contact" sections={sections}
        draft={LEGAL_DETAILS.draft} updatedAt={LEGAL_DETAILS.updatedAt} schemaType="ContactPage" />;
}
