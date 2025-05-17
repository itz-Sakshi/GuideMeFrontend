// app/api/chat-history/[userId]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import ChatModel from "@/model/ChatSession";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();

    const { userId } = await params;

    const chat = await ChatModel.findOne({ userId });
    if (!chat) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: chat.messages });
  } catch (err) {
    console.error("❌ Failed to fetch chat history:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
