"use client";

import React, { useState, useEffect } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { refreshUserFlags } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ResumeUpload = () => {
  const { data: session } = useSession();
  const user = session?.user as User;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submittedResume, setSubmittedResume] = useState(false);
  // const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const router = useRouter();

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      console.log("📎 Selected file:", files[0].name);
    }
  };

  useEffect(() => {
    const refreshUserProps = async () => {
      // 🔁 Refresh flags from server
      const updated = await refreshUserFlags();

      setSubmittedResume(updated.isResumeSubmitted);
    };
    //console.log("🔄 Refreshed flags from server:", updated);
    //   const fetchResumeDownloadUrl = async (userId: string) => {
    //     const res = await fetch(`/api/get-resume-url?userId=${userId}`);
    //     const data = await res.json();
    //     return data.signedUrl;
    //   };
    //   if (session?.user?._id && updated.isResumeSubmitted) {
    //     try {
    //       const signedUrl = await fetchResumeDownloadUrl(session.user._id);
    //       setResumeUrl(signedUrl);
    //     } catch (err) {
    //       console.error("❌ Resume URL not found:", err);
    //       const axiosError = err as AxiosError<ApiResponse>;
    //       const errorMessage =
    //         axiosError.response?.data.message || "Something went wrong.";
    //       toast.error("failed to find Resume URL", {
    //         description: errorMessage,
    //       });
    //     }
    //   }
    // };

    refreshUserProps();
  }, []);
  // session?.user?._id]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("User Not Signed In.", {
        description: "Please Sign In First",
      });
      return;
    }

    if (!selectedFile) {
      toast.error("No PDF selected.", {
        description: "Please select a PDF first",
      });
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("user", JSON.stringify(user));

    try {
      const response = await axios.post<ApiResponse>(
        // -------------------------To Do -------------------------------------------
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`,
        formData
      );
      console.log("✅ Upload result:", response.data);
      const updated = await refreshUserFlags();
      setSubmittedResume(updated.isResumeSubmitted);

      toast.success("Resume Uploaded", {
        description: response.data.message,
      });

      router.replace("/chat");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      const axiosError = err as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message || "Something went wrong.";
      toast.error("Upload failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="bg-slate-900 h-screen text-white flex flex-col justify-center items-center pt-25 p-15 md:p-30">
      <h1 className="text-xl md:text-2xl font-semibold mb-6 text-center">
        Upload your resume so our AI can understand your education and work
        experience.
      </h1>

      <FileUpload onChange={handleFileChange} />
      {submittedResume && (
        <Button
          className="mt-4 text-black-700 bg-cyan-700 cursor-pointer"
          onClick={async () => {
            try {
              const res = await fetch(`/api/get-resume-url?userId=${user._id}`);
              const data = await res.json();
              if (data.signedUrl) {
                window.open(data.signedUrl, "_blank");
              } else {
                toast.error("Download failed", {
                  description: "No resume found",
                });
              }
            } catch (err) {
              console.error("❌ Failed to fetch resume URL:", err);
              toast.error("Download failed", {
                description:
                  "Something went wrong while generating download link",
              });
            }
          }}
        >
          ⬇️ Download Existing Resume
        </Button>
      )}

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
      >
        {submittedResume ? "Update Resume" : "Submit Resume"}
      </button>
    </div>
  );
};

export default ResumeUpload;
