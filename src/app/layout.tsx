import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs'
import { LiveblocksProvider } from "@/components/providers/liveblocks-provider";
import { ToolsProvider } from "@/components/providers/tools-provider";
import { ToolsSidebar } from "@/components/tools-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyNewNote",
  description: "The connected workspace where better, faster work happens.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.svg",
        href: "/logo.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo-dark.svg",
        href: "/logo-dark.svg",
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body className={`${inter.className} h-full`} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LiveblocksProvider>
              <ToolsProvider>
                {children}
                <ToolsSidebar />
              </ToolsProvider>
            </LiveblocksProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
