import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { GoogleProfile } from "next-auth/providers/google";
import { Account, Profile } from "next-auth";

import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            email: credentials.identifier,
          });
          if (!user) {
            throw new Error("No user found with this email");
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          const hashedGooglePassword = await bcrypt.hash(process.env.GOOGLE_LOGIN_PASSWORD?.toString() || "", 10);
          if (await bcrypt.compare(credentials.password, hashedGooglePassword)) {
            throw new Error("Please use some other password");
          }
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      authorization: {
        params: {
          prompt: "consent", // Forces Google to always ask for user consent, even if they previously logged in.
          access_type: "offline", // Ensures Google provides a refresh token, so you can request new access tokens without requiring the user to log in again.
          response_type: "code", // Uses the Authorization Code Flow, where Google returns an authorization code, and your app exchanges it for an access token.
        },
      },
    }),
  ],
  callbacks: {
    // signIn callback to handle user sign up for Google users
    async signIn({
      account,
      profile,
    }: {
      account: Account | null;
      profile?: Profile | GoogleProfile;
    }) {
      if (account?.provider === "google") {
        // Check if the user already exists in your database
        await dbConnect();

        const existingUser = await UserModel.findOne({ email: profile?.email });
        if (!existingUser) {
          const googlePassword = await bcrypt.hash(process.env.GOOGLE_LOGIN_PASSWORD?.toString() || "", 10)
          // If the user does not exist, create a new user
          const newUser = new UserModel({
            email: profile?.email,
            password: googlePassword,
            isProfileSubmitted: false, // Set any default values like `isProfileSubmitted`
            isResumeSubmitted: false,
          });
          await newUser.save(); // Save the new user in the database
        } // Ensure user is populated with isProfileSubmitted before returning

        // Ensure user is populated with isProfileSubmitted before returning
        const user = await UserModel.findOne({ email: profile?.email });
        if (user) {
          return true; // Return true indicating the user was successfully signed in
        }
      }
      return true; // Allow other providers
    },

    async jwt({ token, account, profile, user }) {
      if (account?.provider === "google" && profile) {
        // On Google sign-in, we fetch the user from the database
        await dbConnect();

        const user = await UserModel.findOne({ email: profile?.email });
        if (user) {
          // Populate the JWT with user data
          token._id = user._id?.toString();
          token.email = user.email;
          // token.isResumeSubmitted = user.isResumeSubmitted || false;
          // token.isProfileSubmitted = user.isProfileSubmitted || false;
        }
      }
      else if (user) {
        token._id = user._id?.toString();
        token.email = user.email;
        // token.isResumeSubmitted = user.isResumeSubmitted || false;
        // token.isProfileSubmitted = user.isProfileSubmitted || false;
      }
      // console.log("Token: ", token)
      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id;
      session.user.email = token.email;
      // session.user.isProfileSubmitted = token.isProfileSubmitted;
      // session.user.isResumeSubmitted = token.isResumeSubmitted;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in", // where the unauthenticated user will be redirected by default if they try to access any protected route
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
