import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import ChatModel from "@/model/ChatSession";

// Use NextRequest, not plain Request
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();

    const { userId } = params;

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
