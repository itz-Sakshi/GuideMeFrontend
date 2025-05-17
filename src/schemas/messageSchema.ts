import {z} from "zod"


export const messageSchema = z.object({
    content: z.string().min(4, {message: "Content must be atleast 4 characters"})
    .max(200, {message: "Content must be less than 200 characters."})
})