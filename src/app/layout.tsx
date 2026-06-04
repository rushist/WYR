import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SideNav from "@/components/SideNav";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "WYR — Impossible Choices",
  description:
    "Answer impossible questions. See how the world thinks. A psychological reflection platform that reveals collective human behavior patterns.",
  keywords: ["would you rather", "moral dilemmas", "psychology", "decision making"],
  openGraph: {
    title: "WYR — Impossible Choices",
    description: "Answer impossible questions. See how the world thinks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-void text-text antialiased">
        <AuthProvider>
          <SideNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
