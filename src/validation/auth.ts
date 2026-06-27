import { z } from "zod";

export const registerSchema = z.object({
    email: z.email(),
    password: z
        .string()
        .min(8, "Password must be at least 8 character long")
        .regex(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
            "Password must contain at least one letter, one number, and one special character",
        ),
    fullName: z.string(),
});

export const loginSchema = registerSchema.omit({fullName: true});
