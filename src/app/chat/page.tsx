"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const userId = session?.user?._id;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const lang = localStorage.getItem("chat_language") || "en";


  // const pathname = usePathname();

  // Optional: Load previous messages (if you want to fetch on mount)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!userId && messages.length > 0) {
        e.preventDefault();
        e.returnValue = ""; // deprecated but still required
      }
    };
    const fetchHistory = async () => {
      const res = await axios.get(`/api/chat-history/${userId}`);
      // console.log(res.data.messages);
      setMessages(res.data.messages);
    };

    const hasShown = sessionStorage.getItem("shown_guest_toast");

    if (!userId && !hasShown) {
      toast("Want better answers and saved chat?", {
        id: "guest-toast",
        description:
          "Sign in and submit your profile & resume for personalized immigration help.",
        duration: Infinity, // stays until dismissed
        action: {
          label: "Sign In",
          onClick: () => router.push("/sign-in"),
        },
        cancel: {
          label: "Skip",
          onClick: () => {}, // no-op
        },
      });
      sessionStorage.setItem("shown_guest_toast", "true");
    }
    if (userId) fetchHistory();
    if (messages.length > 0) {
      sessionStorage.setItem("chat_has_messages", "true");
    } else {
      sessionStorage.removeItem("chat_has_messages");
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId, messages.length, router, messages]);

  const downloadChat = () => {
    const fileName = "chat_history.txt";
    const jsonContent = JSON.stringify(messages, null, 2); // Pretty-printed

    const blob = new Blob([jsonContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url); // Clean up
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    const endpoint = userId
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/no-user`;
    try {
      // ---------------------TO DO -----------------------------------
      const promptPrefix =
        lang === "fr" ? "Répondez à cette question en français : " : "";
      const res = await axios.post(endpoint, {
        message: promptPrefix + input,
        ...(userId ? { userId } : { previousMessages: messages }),
      });

      const aiReply: Message = {
        role: "assistant",
        content: res.data.message,
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100vh] min-h-screen w-full  bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="h-full p-4 w-[85%] mx-auto space-y-4 mt-14 bg-black z-10">
        <h1 className="text-xl font-semibold text-white sticky">
          GuideMe Chat
        </h1>
        <div className="border p-4 rounded h-[65%] md:h-[75%] overflow-y-scroll space-y-2 bg-gray-100">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded ${
                msg.role === "user"
                  ? "bg-blue-200 text-right"
                  : "bg-white text-left"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          ))}
          {messages.length > 0 && (
            <button
              className="flex justify-center items-center bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 mx-auto cursor-pointer"
              onClick={downloadChat}
            >
              Download Chat
            </button>
          )}
          {loading && <div className="italic text-gray-500">Typing...</div>}
        </div>
        <div className="w-full flex space-x-2 text-white mx-auto justify-center items-center">
          <input
            className="flex border px-3 py-2 rounded w-[70%]"
            placeholder={
              messages.length === 0
                ? "Hi, ask me about immigration queries..."
                : "Any further queries..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            className="bg-blue-600 text-white p-2 disabled:opacity-50 cursor-pointer"
            onClick={handleSend}
            disabled={loading}
          >
            Send
          </Button>
          <Button
            className="cursor-pointer p- bg-white text-black hover:bg-slate-500"
            onClick={async () => {
              // ---------------------TO Do -----------------------------
              if (userId) {
                await axios.delete(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat-history/${userId}`
                );
              }
              setMessages([]);
            }}
          >
            Clear Chat
          </Button>
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
}
