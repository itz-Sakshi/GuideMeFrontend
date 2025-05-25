"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import {
  Form,
  FormItem,
  FormMessage,
  FormLabel,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { refreshUserFlags } from "@/lib/utils";

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { BackgroundBeams } from "@/components/ui/background-beams";
import {User} from "next-auth"

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const debounced = useDebounceCallback(setEmail, 900);
  const router = useRouter();

  // Zod

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {data: session} = useSession()

  useEffect(() => {
    const checkEmailIsUnique = async () => {
      if (email) {
        setIsCheckingEmail(true);
        setEmailMessage("");
        try {
          const response = await axios.get(
            `/api/check-email-unique?email=${email}`
          );
          setEmailMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setEmailMessage(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingEmail(false);
        }
      }
    };
    const checkAndRedirect = async () => {
      if (!session) return;

      const res = await refreshUserFlags();
      if (!res) return;

      const { isProfileSubmitted, isResumeSubmitted } = res;
      const user = session.user as User;

      if (!isProfileSubmitted) {
        router.replace(`/profile/${user._id}`);
      } else if (!isResumeSubmitted) {
        router.replace(`/resume/${user._id}`);
      } else {
        router.replace(`/chat/${user._id}`);
      }
    };

    checkAndRedirect();
    checkEmailIsUnique();
  }, [email, session, router]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
      toast("Success", {
        description: response.data.message,
      });
      router.replace(`/sign-in`);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in signup of user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast.error("SignUp error", {
        description: errorMessage,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex sm:justify-between justify-center  bg-neutral-950 items-center space-x-6 px-4 md:px-24 h-screen my-auto">
      <div className="sm:w-1/2 sm:block hidden max-w-md rounded-lg shadow-md h-full z-100">
      <Image className="h-[100vh] w-full"
        src="/images/SignUp_CN_tower.jpg" // Path to your image (public folder)
        alt="Example image"
        width={400} // Desired width
        height={50} // Desired height
      />
      </div>
      <div className="sm:w-1/2 w-full max-w-md p-4 md:mt-14 bg-white rounded-lg space-y-3 shadow-md z-100">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl z-10">
            <span className="text-green-500">Join</span> GuideMe.ca
          </h1>
          <p className="hidden sm:block md:m-6 m-2">
            Sign up to get professional answers to all your immigration
            questions
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      debounced(e.target.value);
                    }}
                  />
                  {isCheckingEmail && <Loader2 className="animate-spin" />}
                  {!isCheckingEmail && emailMessage && (
                    <p
                      className={`text-sm ${
                        emailMessage === "Email is unique"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {emailMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full cursor-pointer mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up For Free"
              )}
            </Button>
          </form>
        </Form>
        <p className="font-semibold w-full text-center md:my-2 my-1">Or</p>
        <div>
          <Button className="w-full cursor-pointer" onClick={() => signIn("google")}>
            {" "}
            Connect With Your Google Account
          </Button>
        </div>
        <div className="text-center">
          <p>
            Already a member?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
        <div>
          <Button className="w-full cursor-pointer">
          <Link href="/chat" className="text-blue-400 hover:text-blue-800">
              Continue as a Guest
            </Link>
          </Button>
        </div>
        
      </div>
      <BackgroundBeams className="z-10"/>
    </div>
  );
};

export default SignUpPage;
