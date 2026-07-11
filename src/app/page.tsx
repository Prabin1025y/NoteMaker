import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
    const session = await auth();

    if (session) redirect("/dashboard");
    return (
        <div className="min-h-screen w-full bg-white text-slate-900 font-sans">
            {/* NAV */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <a
                        href="#top"
                        className="flex items-center gap-2 font-bold text-lg"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                            <Layers className="h-4 w-4" />
                        </span>
                        Stax
                    </a>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="text-slate-600"
                        >
                            Log in
                        </Button>
                        <Button className="bg-violet-600 hover:bg-violet-700">
                            Get started
                        </Button>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <section
                id="top"
                className="relative overflow-hidden"
            >
                {/* soft purple background blobs */}
                {/* <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-300 opacity-40 blur-3xl" />
                <div className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-fuchsia-200 opacity-50 blur-3xl" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-50 via-white to-white" /> */}

                <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
                    <div
                        className={`transition-all duration-700 ease-out opacity-100 translate-y-0`}
                    >
                        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 mb-6">
                            Built for students
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
                            Notes that build themselves,{" "}
                            <span className="text-violet-600">
                                block by block.
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto">
                            Mix headings, checklists, highlights and code into
                            one page, generate a summary with AI, then export a
                            clean PDF before class ends.
                        </p>
                    </div>

                    <div
                        className={`mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 ease-out delay-150 opacity-100 translate-y-0`}
                    >
                        <SignInButton />
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </div>
    );
}
