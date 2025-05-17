import UserModel from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse"
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(request: Request){
    await dbConnect();
    try{
        const {email, password} = await request.json();
        const existingUser = await UserModel.findOne({
            email
        })
        if (existingUser){
            return Response.json(new ApiResponse(400, [], "email is already taken"), {status: 400})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            email,
            password: hashedPassword,
            isProfileSubmitted: false,
            isResumeSubmitted: false
        })

        await newUser.save();
        const user = await UserModel.findById(newUser._id).select('-password')
        return Response.json({data: user, message: "User registered successfully. Please sign in to your account."}, {
            status: 201
        })

    }
    catch(error){
        console.log("Error registering user", error)
        return Response.json(new ApiResponse(500, [], `Something went wrong while registering the user, ${error}`), {status: 500})
    }
}