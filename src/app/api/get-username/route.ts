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

    const user = await ProfileModel.findById(token._id).select("name");

    if (!user) {
      return NextResponse.json(new ApiResponse(404, null, "User not found"), { status: 404 });
    }

    return NextResponse.json(new ApiResponse(200, { name: user.name }, "User name fetched successfully"));
  } catch (error) {
    console.error("Error finding username:", error);
    return NextResponse.json(
      new ApiResponse(500, null, "Internal Server Error"),
      { status: 500 }
    );
  }
}


