"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { profileSchema } from "@/schemas/profileSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { User } from "next-auth";
import Image from "next/image";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useSession } from "next-auth/react";
import { dbConnect } from "@/lib/dbConnect";
import { useEffect, useState } from "react";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Profile } from "@/model/Profile";
import { refreshUserFlags } from "@/lib/utils";

export default function SignInForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submittedProfile, setSubmittedProfile] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      current_status: "Study Permit",
      province: "Ontario",
      age: 19,
      marital_status: "Never Married or Single",
      language_proficiency: "English",
      additional_info: "",
    },
  });

  useEffect(() => {
    const getUserProfile = async () => {
      await dbConnect();
      const response = await axios.get("/api/get-profile");
      const profileData = response.data.data;
      if (profileData) {
        // console.log(profileData)
        setProfile(profile);
        form.reset(profileData);
      } else {
        setProfile(null);
      }
    };
    const refreshUserProps = async () => {
      // 🔁 Refresh flags from server
    const updated = await refreshUserFlags();
    setSubmittedProfile(updated.isProfileSubmitted);
    // console.log("🔄 Refreshed flags from server:", updated);
    };
    refreshUserProps();
    getUserProfile();
  }, [session, profile, form, submittedProfile]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    const result = await axios.post<ApiResponse>("/api/submit-profile", data);
    if (!result) {
      toast.error("Error", {
        description: "Error submitting profile",
      });
    }
    toast("Profile Updated successfully.", {
      description: result.data.message,
    });
    const updated = await refreshUserFlags();
    //console.log(updated);
    // setSubmittedResume(updated.isResumeSubmitted);
    // console.log(submittedResume);
    const user = session?.user as User;
    if (updated.isResumeSubmitted === false) {
      router.replace(`/resume/${user._id}`);
    } else {
      router.replace(`/chat`);
    }
  };

  return (
    <div className="flex sm:justify-between justify-center space-x-6 bg-neutral-950 items-center px-10 md:px-24">
      <div className="sm:w-1/2 sm:block hidden max-w-md rounded-lg shadow-md h-full z-100">
        <Image
          className="h-[100vh] w-full"
          src="/images/SignUp_CN_tower.jpg" // Path to your image (public folder)
          alt="Example image"
          width={400} // Desired width
          height={50} // Desired height
          priority
        />
      </div>
      <div className="sm:w-1/2 w-full max-w-md p-4 my-16 bg-white rounded-lg space-y-2 shadow-md z-40">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            GuideMe.ca
          </h1>
          <p className="m-6">
            Submit your profile to get even better guidance for Canadian
            immigration
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Status */}
            <FormField
              name="current_status"
              control={form.control}
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Current Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your status" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Study Permit",
                        "Work Permit",
                        "Permanent Resident",
                        "Refugee",
                        "Visitor",
                        "Other",
                      ].map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Province */}
            <FormField
              name="province"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Ontario",
                        "Alberta",
                        "British Columbia",
                        "Manitoba",
                        "New Brunswick",
                        "Newfoundland and Labrador",
                        "Nova Scotia",
                        "Prince Edward Island",
                        "Quebec",
                        "Saskatchewan",
                      ].map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Age */}
            <FormField
              name="age"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marital Status */}
            <FormField
              name="marital_status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Never Married or Single",
                        "Married",
                        "Widowed",
                        "Anulled Marriage",
                        "Legally Separated",
                        "Common-Law",
                        "Divorced or Separated",
                      ].map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language Proficiency */}
            <FormField
              name="language_proficiency"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language Proficiency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {["English", "French", "Both"].map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Info */}
            <FormField
              name="additional_info"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Info</FormLabel>
                  <Input
                    {...field}
                    placeholder="Anything else you want to add?"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button type="submit" className="w-full mt-4">
              {!submittedProfile? "Submit Profile": "Update Profile"}
            </Button>
          </form>
        </Form>
      </div>
      <BackgroundBeams className="z-10" />
    </div>
  );
}
