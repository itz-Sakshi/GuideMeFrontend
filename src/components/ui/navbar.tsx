"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircleMoreIcon } from "lucide-react";
import { HoveredLink, Menu, MenuItem } from "../ui/navbar-menu";
import { Button } from "./button";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import axios from "axios";
import { usePathname } from "next/navigation";
import { refreshUserFlags } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const Navbar = () => {
  const [active, setActive] = useState<string | null>(null);
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  const user: User = session?.user as User;
  const pathname = usePathname();
  const [language, setLanguage] = useState<"en" | "fr">("en");

  useEffect(() => {
    const getUserName = async () => {
      if (user) {
        try {
          const updated = await refreshUserFlags();
          setHasProfile(updated.isProfileSubmitted);
          const response = await axios.get("/api/get-username");
          if (!response) {
            setName("");
          }
          setName(response?.data?.data?.name.split(" ")[0]);
        } catch (err) {
          console.error("Failed to fetch username:", err);
          setName("");
        }
      }
    };
    if (typeof window !== "undefined") {
      const savedLang = sessionStorage.getItem("chat_language") as "en" | "fr";
      if (savedLang) {
        setLanguage(savedLang);
      }
    }
    getUserName();
  }, [user, pathname]);
  const handleSignOut = async () => {
    await fetch("/api/revoke-token", { method: "POST" });
    await signOut({ callbackUrl: "/" });
  };
  return (
    <div className="flex max-w-fit fixed top-2 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-[#a69b9b] shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2  items-center justify-center space-x-4">
      <Link
        href="/"
        className="text-xl font-bold text-black justify-items-center flex"
      >
        GuideMe.ca
      </Link>
      <Link
        href="/chat"
        className="relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-800 dark:hover:text-neutral-200 hover:text-neutral-600"
      >
        <span>
          <MessageCircleMoreIcon className="hidden sm:inline" />
        </span>
        <span className="block text-sm">AI Chat</span>
      </Link>
      {/* <Link
        href="/news"
        className="relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-800 dark:hover:text-neutral-200 hover:text-neutral-600"
      >
        <span>
          <EarthIcon className="hidden sm:inline" />
        </span>
        <span className="block text-sm">News</span>
      </Link> */}
      {session ? (
        <>
          <Menu setActive={setActive}>
            <MenuItem
              setActive={setActive}
              active={active}
              item="User Settings"
            >
              <div className="flex flex-col space-y-4 text-sm">
                <span className="text-xl">
                  Hi, {name !== "" ? name : user.email?.split("@")[0]}
                </span>
                <HoveredLink href={`/profile/${user._id}`}>
                  <Button className="w-full">User Profile</Button>
                </HoveredLink>
                {hasProfile && (
                  <HoveredLink href={`/resume/${user._id}`}>
                    <Button className="w-full">Upload Resume</Button>
                  </HoveredLink>
                )}
                <Button onClick={handleSignOut}>Log Out</Button>
              </div>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <Link href="/sign-in" className="pr-5">
            <button className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full hover:border-blue-300 hover:border-x-fuchsia-200 hover:cursor-pointer">
              <span>Log In</span>
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent to-transparent  h-px" />
            </button>
          </Link>
        </>
      )}
      {pathname === "/chat" && (
        <Select
          disabled={
            typeof window !== "undefined" &&
            sessionStorage.getItem("chat_has_messages") === "true"
          }
          onValueChange={(value: "en" | "fr") => {
            setLanguage(value);
            sessionStorage.setItem("chat_language", value);
          }}
          value={language}
        >
          <SelectTrigger className="w-[120px] bg-white text-black text-sm ml-0 rounded-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black z-100">
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">French</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default Navbar;
