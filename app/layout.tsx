import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/devhunt/site-header";

export const metadata: Metadata = {
  title: "DevHunt",
  description: "Discover and launch the best new products in tech.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-white font-sans text-gray-900")}>
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <div className="min-h-screen">
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
              <SiteHeader />
              <main id="main-content" className="ph-container py-6">
                {children}
              </main>
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
