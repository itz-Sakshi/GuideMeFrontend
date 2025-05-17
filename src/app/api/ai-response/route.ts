import OpenAI from "openai";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import ProfileModel from "@/model/Profile";
import { ApiResponse } from "@/types/ApiResponse";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export const runtime = "edge";

export async function GET(request: Request){
    await dbConnect();
    const {searchParams} = new URL(request.url);
    const email = searchParams.get("email");
    const existingUserWithEmail = await UserModel.findOne({email});
    if (!existingUserWithEmail){
        return Response.json(new ApiResponse(400, [], "No user found with this email"), {status: 400})
    }
    const userProfile = await ProfileModel.findOne({user_id: existingUserWithEmail._id})
    if (!userProfile){
        return Response.json(new ApiResponse(400, [], "No user found with this user id"), {status: 400})
    }
    try{
        const prompt =
        `
        You are an AI immigration assistant that provides expert advice on Canadian immigration.
        **You must only answer using the provided official data** from:
        - Government of Canada (canada.ca, ircc.gc.ca)
        - Ontario Government (ontario.ca)
        - Other provincial government websites.

        If the question is outside these sources, respond with:
        "I'm sorry, but I can only provide information from official Canadian government sources."

        ### User Profile:
        ${JSON.stringify(userProfile)}

        Now, answer the user's query strictly based on the provided data.
        `;
  
      const response = await openai.completions.create({
        model: 'gpt-4-turbo-instruct',
        max_tokens: 200,
        stream: true, // Enable streaming
        prompt,
      }); 

      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller){
            try{
                for await (const chunk of response){
                    controller.enqueue(encoder.encode(chunk.choices[0].text));
                }
                controller.close();
            }catch(error){
                controller.error(error);
            }
        }
      })
      return new Response(stream, {
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      return Response.json({ error, message: "OpenAI api backend error", success: false }, { status: 500 });
    }
}
