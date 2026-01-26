import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Resource Management System | Streamline Your Resources",
  description: "A modern platform to manage and book organizational resources like classrooms, labs, auditoriums, and more. Streamline bookings, maintenance, and reporting.",
  keywords: ["resource management", "booking system", "facilities management", "maintenance tracking"],
  authors: [{ name: "RMS Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
