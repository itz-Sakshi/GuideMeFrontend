import { dbConnect } from "@/lib/dbConnect";
import ProfileModel from "@/model/Profile";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/ApiResponse";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const token = await getToken({ req });

    if (!token || !token._id) {
      return NextResponse.json(new ApiResponse(401, null, "Unauthorized"), { status: 401 });
    }

    let profile = (await ProfileModel.findById(token._id));
    profile = profile || null;

    

    return NextResponse.json(new ApiResponse(200, profile, "Profile fetched successfully"));
  } catch (error) {
    console.error("Error finding profile:", error);
    return NextResponse.json(
      new ApiResponse(500, null, "Internal Server Error"),
      { status: 500 }
    );
  }
}


