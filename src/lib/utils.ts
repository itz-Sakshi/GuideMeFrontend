import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// utils/updateSessionFields.ts
export async function refreshUserFlags(host?: string) {
  try {
    const baseUrl = host ? `http://${host}` : ""; // works for middleware
    const res = await fetch(`${baseUrl}/api/update-session`);

    if (!res.ok) throw new Error("Failed to fetch session flags");

    const updated = await res.json();
    return updated;
  } catch (error) {
    console.error("❌ Failed to refresh session fields:", error);
    return null;
  }
}

