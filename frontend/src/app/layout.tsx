import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PermissionProvider } from "@/hooks/usePermissions";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Library Dashboard",
  description: "A dashboard for managing a library system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PermissionProvider>
            {children}
            <Toaster richColors position="top-right" />
          </PermissionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
