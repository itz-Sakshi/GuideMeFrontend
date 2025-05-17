import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";
 

export default function Home() {
  return (
    <div className="h-[40rem] w-full  bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-3xl md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          GuideMe.ca
        </h1>
        <p></p>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-xl text-center relative z-10">
        Helping Immigrants Settle & Stay in Canada. Get expert immigration advice in seconds!
        </p>
        <Link href="/sign-up">
        <button 
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-3/4 text-center m-auto text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] mt-8 z-100 cursor-pointer"
        >
          Get Started for free
        </button>
        </Link>
      </div>
      <BackgroundBeams />
    </div>
  );
}
