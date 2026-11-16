import PublicDocument, { type DocumentSection } from "@/components/public/PublicDocument";
import { LEGAL_DETAILS } from "@/lib/legal";
import { publicMetadata } from "@/lib/seo";
import styles from "@/components/public/public.module.css";

const description = "The authentication cookies and local theme storage used by Eton Note, their purposes and lifetimes, and how to control browser storage.";
export const metadata = publicMetadata({
    title: "Cookie Policy", description, path: "/cookies", draft: LEGAL_DETAILS.draft,
});

const cookies = [
    ["authjs.session-token", "Keeps your authenticated session. Large tokens may be split into numbered cookies such as .0 and .1.", "Up to 30 days; renewed when an active session is refreshed."],
    ["authjs.callback-url", "Remembers the destination to return to after authentication.", "Browser session."],
    ["authjs.csrf-token", "Protects authentication requests against cross-site request forgery.", "Browser session."],
    ["authjs.pkce.code_verifier", "Protects the OAuth authorization-code exchange when used by the sign-in flow.", "Up to 15 minutes; cleared as the flow completes."],
    ["authjs.state", "Checks that an OAuth response belongs to the sign-in request when used.", "Up to 15 minutes; cleared as the flow completes."],
    ["authjs.nonce", "Checks an identity response when required by the authentication flow.", "Browser session; cleared as the flow completes."],
];

const sections: DocumentSection[] = [
    {
        id: "overview", title: "Cookies and browser storage",
        content: <>
            <p>Cookies are small values your browser sends with matching requests. Local storage holds values in your browser but does not automatically send them with each request.</p>
            <p>Eton Note uses authentication cookies through Auth.js and local storage for theme preferences. No optional analytics, advertising, or marketing tracking is enabled in the current setup.</p>
        </>,
    },
    {
        id: "authentication", title: "Authentication cookies",
        content: <>
            <p>The names below describe the current Auth.js defaults. Google’s sign-in flow may use only the security cookies relevant to that request.</p>
            <div className={styles.tableWrap} role="region" aria-label="Authentication cookie reference" tabIndex={0}>
                <table>
                    <caption>Auth.js cookies used for sign-in and sessions</caption>
                    <thead><tr><th scope="col">Base cookie name</th><th scope="col">Purpose</th><th scope="col">Lifetime</th></tr></thead>
                    <tbody>{cookies.map(([name, purpose, lifetime]) => (
                        <tr key={name}><th scope="row"><code>{name}</code></th><td>{purpose}</td><td>{lifetime}</td></tr>
                    ))}</tbody>
                </table>
            </div>
            <p className={styles.tableHint}>On a narrow screen, scroll the table sideways to read every column.</p>
            <p>On HTTPS deployments, names normally have the <code>__Secure-</code> prefix; the CSRF cookie normally uses <code>__Host-</code>. Local HTTP development can use unprefixed names. Authentication cookies use HttpOnly and SameSite protections, with Secure enabled on HTTPS.</p>
            <p>A browser-session cookie has no explicit persistent expiry. Browser session-restore settings can preserve it across restarts. Signing out removes the authenticated session but may leave other short-lived flow or browser preference values.</p>
        </>,
    },
    {
        id: "preferences", title: "Local theme preferences",
        content: <>
            <dl>
                <dt><code>theme</code></dt><dd>Stores the light/dark preference used by next-themes.</dd>
                <dt><code>custom-theme</code></dt><dd>Stores the selected Eton Note workspace theme.</dd>
            </dl>
            <p>These local-storage entries have no automatic expiry in the app. They remain until changed or cleared in your browser. They are preferences, not advertising identifiers, and are not automatically sent to the server as cookies.</p>
        </>,
    },
    {
        id: "third-parties", title: "Google and other services",
        content: <>
            <p>When you leave Eton Note to sign in with Google, Google may use its own cookies and storage on its domains. Those are controlled by Google, not by Eton Note’s cookie settings. See <a href="https://policies.google.com/technologies/cookies">Google’s cookie information</a>.</p>
            <p>Hosting and integrated services may have their own operational practices. The operator must confirm deployment-level integrations before release and keep this notice accurate if that setup changes. Data sent to the image, AI, and PDF services is described in the <a href="/privacy#providers">Privacy Policy</a>.</p>
        </>,
    },
    {
        id: "controls", title: "Your browser controls",
        content: <>
            <ul>
                <li>Sign out to end your authenticated Eton Note session.</li>
                <li>Use your browser’s site-data settings to remove Eton Note cookies and local storage.</li>
                <li>Change your theme in the app, or clear local storage to remove its saved preference.</li>
                <li>Manage Google’s cookies and account settings separately on Google’s services.</li>
            </ul>
            <p>Blocking essential cookies can prevent sign-in or session features from working. Clearing browser storage does not delete notes or account records stored on the server; see the <a href="/privacy#retention">deletion information</a>.</p>
        </>,
    },
    {
        id: "consent-updates", title: "Optional tracking and policy changes",
        content: <>
            <p>The confirmed setup does not include optional tracking, so Eton Note has not added a consent banner or a misleading “accept all” control. Essential authentication remains available without an unnecessary tracking-consent step.</p>
            <p>If non-essential tracking is introduced, the operator must update this policy and implement any required consent controls before that technology loads. Consent must not be assumed from visiting this page.</p>
            <p>Questions can be directed to the privacy contact once it is published on the <a href="/contact">Contact page</a>. The current contact details remain placeholders pending legal review in {LEGAL_DETAILS.country}.</p>
        </>,
    },
];

export default function CookiePage() {
    return <PublicDocument title="Cookie Policy" description={description} path="/cookies" sections={sections}
        draft={LEGAL_DETAILS.draft} updatedAt={LEGAL_DETAILS.updatedAt}
        related={[{ href: "/privacy", label: "Privacy Policy" }, { href: "/terms", label: "Terms of Service" }, { href: "/contact", label: "Contact details" }]} />;
}
