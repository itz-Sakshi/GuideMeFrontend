import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod";
import { emailValidation } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";

const EmailQuerySchema = z.object({
    email: emailValidation
})

export async function GET(request: Request){
    await dbConnect();

    try{
        const {searchParams} = new URL(request.url);
        const queryParam = {
            email: searchParams.get("email")
        }
        // Validate with ZOD;
        const result = EmailQuerySchema.safeParse(queryParam)
        if(!result.success){
            const emailErrors = result.error.format().email?._errors || [];
            return Response.json({ message: emailErrors?.length > 0 ? emailErrors.join(", ") : "Invalid query parameters", success: false}, {status: 400})
        }
        const {email} = result.data;
        const existingUserWithEmail = await UserModel.findOne({email});
        if (existingUserWithEmail){
            return Response.json(new ApiResponse(400, [], "email is already taken"), {status: 400})
        }
        return Response.json(new ApiResponse(200, [], "Email is unique"), {status: 200})
    }
    catch(error){
        console.error("Error checking email", error);
        return Response.json( new ApiResponse(500, [], `Error checking email ${error}`), {status: 500})
    }
}