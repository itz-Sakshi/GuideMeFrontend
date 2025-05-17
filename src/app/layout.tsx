import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/ui/navbar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
    <AuthProvider>
      <body>
        <Navbar/>
        {children}
        <Toaster />
      </body>
    </AuthProvider>
    </html>
  );
}
