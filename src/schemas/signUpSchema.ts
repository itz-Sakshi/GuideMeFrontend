import {z} from "zod"

export const emailValidation = z
            .string()
            .regex(/.+\@.+\..+/, "please use a valid email address")

export const signUpSchema = z.object({
    email: emailValidation,
    password: z.string().min(6, {message: "Password must be atleast 6 characters"})
})