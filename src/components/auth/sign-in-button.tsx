import { signIn } from "@/auth";
import { Button } from "../ui/button";

// Google "G" mark — brand icon, not decorative art, used for the sign-in button
function GoogleIcon() {
    return (
        <svg
            viewBox="0 0 48 48"
            width="20"
            height="20"
        >
            <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.1-17.7 10.7z"
            />
            <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.7 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.9 39.8 16.4 44 24 44z"
            />
            <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C39.9 37.4 44 31.2 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
        </svg>
    );
}

export function SignInButton() {
    return (
        <form
            action={async () => {
                "use server";
                await signIn("google");
            }}
        >
            <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-white border-slate-300 hover:bg-slate-50 h-12 cursor-pointer px-6 text-base"
            >
                <GoogleIcon />
                Continue with Google
            </Button>
        </form>
    );
}
