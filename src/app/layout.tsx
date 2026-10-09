import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { StoreShell } from "@/components/StoreShell";
import { FormValidationEnforcer } from "@/components/FormValidationEnforcer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X-ON — Press On. Slay On. Repeat. | Handmade Press-on Nails",
  description:
    "X-ON is where modern nail artistry meets effortless beauty. Handmade press-on nails and selected nail essentials designed with quality, style, and performance in mind.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-rose-100 selection:text-rose-900">
        <FormValidationEnforcer />
        <AdminAuthProvider>
          <CartProvider>
            <StoreShell>{children}</StoreShell>
          </CartProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
