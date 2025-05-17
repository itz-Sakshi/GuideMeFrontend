"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface RouteChangeGuardProps {
  messages: { role: "user" | "assistant"; content: string }[];
}

export const RouteChangeGuard = ({ messages }: RouteChangeGuardProps) => {
  const { data: session } = useSession();
  const userId = session?.user?._id;
  const pathname = usePathname();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (!userId && messages.length > 0 && pathname !== lastPathname.current) {
      toast.warning("Chat will be lost if you leave — you're not signed in.");
    }
    lastPathname.current = pathname;
  }, [pathname, userId, messages.length]);

  return null;
};
