"use client";
import { apiFetch } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginForm = {
    email: string;
    password: string;
};

type LoginErrors = Partial<Record<keyof LoginForm, string>>;

export default function Login() {
    const [form, setForm] = useState<LoginForm>({
        email: "",
        password: "",
    });

    const router = useRouter();

    const [errors, setErrors] = useState<LoginErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateField = (name: keyof LoginForm, value: string) => {
        switch (name) {
            case "email":
                if (!value.trim()) return "Email is required";
                if (!/^\S+@\S+\.\S+$/.test(value))
                    return "Invalid email format";
                return "";

            case "password":
                if (!value) return "Password is required";
                return "";

            default:
                return "";
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as {
            name: keyof LoginForm;
            value: string;
        };

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newErrors: LoginErrors = {
            email: validateField("email", form.email),
            password: validateField("password", form.password),
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) return;

        console.log(process.env.NEXT_PUBLIC_WEBSITE_URL);
        console.log(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/auth/login`)

        const res = await apiFetch(
            `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/auth/login`,
            {
                method: "POST",
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                }),
            },
        );

        const data = await res.json();
        alert(data?.message);
        setIsLoading(false);
        if (res.ok) router.push("/");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-md"
            >
                <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>

                {/* Email */}
                <div className="mb-4">
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                            errors.email
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                        }`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="mb-6">
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                            errors.password
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                        }`}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !!!form.email || !!!form.password}
                    className={`${(isLoading || !!!form.email || !!!form.password) && "opacity-70 cursor-not-allowed"} w-full flex items-center justify-center rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700`}
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin ease-initial" />
                    ) : (
                        "Login"
                    )}
                </button>
                <p className="w-full text-sm text-gray-500 py-2 flex justify-center items-center">
                    Don`&apos;`t have an account yet?
                    <Link
                        prefetch={false}
                        className="text-blue-500"
                        href={"/register"}
                    >
                        Register Here
                    </Link>
                </p>
            </form>
        </div>
    );
}
