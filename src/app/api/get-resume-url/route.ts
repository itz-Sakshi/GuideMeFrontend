import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { dbConnect } from "@/lib/dbConnect"; // Your custom DB connect utility
import ProfileModel from "@/model/Profile";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await dbConnect();

    const profile = await ProfileModel.findById(userId);
    const resumeUrl = profile?.resume;

    if (!resumeUrl) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const publicId = resumeUrl.split("/resumes/")[1];
    const signedUrl = cloudinary.utils.private_download_url(
      `resumes/${publicId}`,
      "pdf",
      {
        resource_type: "raw",
        type: "authenticated",
        expires_at: Math.floor(Date.now() / 1000) + 5 * 60, // 5 min expiry
      }
    );

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("❌ Resume download URL error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
