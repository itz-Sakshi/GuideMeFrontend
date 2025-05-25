"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signInSchema } from "@/schemas/signInSchema";

import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { refreshUserFlags } from "@/lib/utils";
import { useEffect } from "react";

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { data: session } = useSession();

  useEffect(() => {
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
  }, [session, router]);

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.email,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast.error("Login Failed", {
          description: "Incorrect username or password",
        });
      } else {
        toast.error("Error", {
          description: result.error,
        });
      }
    }
    //-------------MIDDLEWARE IS DOING THE SAME WORK----------------------------------------
    if (result?.url) {
      if (session) {
        // console.log(session); session has user(which has _id, email, isProfileSubmitted)
        const user = session.user as User;
        const updated = await refreshUserFlags();
        if (updated.isProfileSubmitted === false) {
          router.replace(`/profile/${user._id}`);
        } else {
          router.replace(`/chat`);
        }
      } else {
        router.replace(`/sign-in`);
      }
    }
  };

  return (
    <div className="flex sm:justify-between justify-center bg-neutral-950 items-center space-x-6 px-10 md:px-24 h-screen my-auto">
      <div className="sm:w-1/2 sm:block hidden max-w-md rounded-lg shadow-md h-full z-100">
        <Image
          className="h-[100vh] w-full"
          src="/images/SignUp_CN_tower.jpg" // Path to your image (public folder)
          alt="Example image"
          width={400} // Desired width
          height={50} // Desired height
        />
      </div>
      <div className="sm:w-1/2 w-full max-w-md md:p-4 p-2 mt-14 bg-white rounded-lg space-y-2 shadow-md z-100">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            GuideMe.ca
          </h1>
          <p className="hidden sm:block md:m-6 m-2">
            Sign in to get reliable Canadian immigration guidance
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
                  <Input {...field} />
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
                  <Input type="password" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full cursor-pointer mt-2" type="submit">
              Sign In
            </Button>
          </form>
        </Form>
        <p className="font-semibold w-full text-center md:my-2 my-1">Or</p>
        <div>
          <Button
            className="w-full cursor-pointer"
            onClick={() => signIn("google")}
          >
            {" "}
            Connect With Your Google Account
          </Button>
        </div>
        <div className="text-center">
          <p>
            Not a member yet?{" "}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
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
      <BackgroundBeams className="z-10" />
    </div>
  );
}
