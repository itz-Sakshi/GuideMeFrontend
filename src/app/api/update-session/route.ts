// app/api/update-session/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

export async function GET() {
    await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await UserModel.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    isResumeSubmitted: user.isResumeSubmitted,
    isProfileSubmitted: user.isProfileSubmitted,
  });
}

