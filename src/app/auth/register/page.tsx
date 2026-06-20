"use client";
import { apiFetch } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterForm = {
    fullName: string;
    email: string;
    password: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

export default function Register() {
    const [form, setForm] = useState<RegisterForm>({
        fullName: "",
        email: "",
        password: "",
    });

    const router = useRouter();

    const [errors, setErrors] = useState<RegisterErrors>({});

    const validateField = (name: keyof RegisterForm, value: string): string => {
        switch (name) {
            case "fullName":
                if (!value.trim()) return "Full name is required";
                if (value.trim().length < 3)
                    return "Full name must be at least 3 characters";
                return "";

            case "email":
                if (!value.trim()) return "Email is required";
                if (!/^\S+@\S+\.\S+$/.test(value))
                    return "Invalid email format";
                return "";

            case "password":
                if (!value) return "Password is required";
                if (value.length < 6)
                    return "Password must be at least 6 characters";
                return "";

            default:
                return "";
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as {
            name: keyof RegisterForm;
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

        const newErrors: RegisterErrors = {
            fullName: validateField("fullName", form.fullName),
            email: validateField("email", form.email),
            password: validateField("password", form.password),
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) return;

        // console.log("REGISTER:", form);
        const res = await apiFetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                email: form.email,
                password: form.password,
            }),
        });

        const data = await res.json();
        alert("Registered")
        router.push("/auth/login");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-md"
            >
                <h1 className="mb-6 text-center text-2xl font-bold">
                    Register
                </h1>

                {/* Full Name */}
                <div className="mb-4">
                    <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                            errors.fullName
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                        }`}
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.fullName}
                        </p>
                    )}
                </div>

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
                    className="w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700"
                >
                    Create Account
                </button>
            </form>
        </div>
    );
}
