import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/devhunt/site-header";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const sansFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "DevHunt",
  description: "Editorial product discovery for indie developers, makers, and curious builders.",
  icons: {
    icon: "/convex.svg",
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
      className={cn(headingFont.variable, sansFont.variable, monoFont.variable)}
    >
      <body className="min-h-screen">
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <div className="editorial-shell min-h-screen">
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
              <SiteHeader />
              <main
                id="main-content"
                className="mx-auto flex w-full max-w-[92rem] flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10"
              >
                {children}
              </main>
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
