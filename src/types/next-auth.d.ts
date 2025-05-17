import "next-auth"
import { DefaultSession } from "next-auth";

declare module "next-auth"{
    interface User{
        _id?: string;
        email?: string;
        // isResumeSubmitted?: boolean;
        // isProfileSubmitted?: boolean;
    }
    interface Session{
        user: {
        _id?: string;
        email?: string
        // isResumeSubmitted?: boolean;
        // isProfileSubmitted?: boolean;
    } & DefaultSession["user"] // default session should always have a default key "user"
    }
}

declare module "next-auth/jwt"{
    interface JWT {
        _id?: string;
        email?: string;
        // isResumeSubmitted?: boolean;
        // isProfileSubmitted?: boolean;
    }
}