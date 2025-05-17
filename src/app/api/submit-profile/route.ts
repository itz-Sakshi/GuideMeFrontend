import UserModel from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import { dbConnect } from "@/lib/dbConnect";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import ProfileModel from "@/model/Profile";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  // console.log("token:", token);
  if (!token || !token._id) {
    return NextResponse.json(new ApiResponse(401, null, "Unauthorized"), {
      status: 401,
    });
  }

  await dbConnect();
  try {
    const {
      name,
      current_status,
      province,
      age,
      marital_status,
      language_proficiency,
      additional_info,
    } = await req.json();
    const user = await UserModel.findById(token._id);
    if (!user) {
      return NextResponse.json(
        new ApiResponse(500, null, "No profile found with this user id"),
        {
          status: 500,
        }
      );
    }
    // console.log("user", user);
    // Check if profile exists
    const profile = await ProfileModel.findById(token._id);
    if (profile) {
        profile.name = name;
        profile.current_status = current_status;
        profile.province = province;
        profile.age = age;
        profile.marital_status = marital_status;
        profile.language_proficiency = language_proficiency;
        profile.additional_info = additional_info;
        await profile.save();
    } else {
      await ProfileModel.create({
        _id: user._id,
        name,
        current_status,
        province,
        age,
        marital_status,
        language_proficiency,
        additional_info,
      });
    }
    user.isProfileSubmitted = true;
    await user.save();

    return Response.json(
      {
        message: "Profile Updated successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Error Updating Profile", error);
    return Response.json(
      new ApiResponse(
        500,
        [],
        `Something went wrong while updating the profile, ${error}`
      ),
      { status: 500 }
    );
  }
}
