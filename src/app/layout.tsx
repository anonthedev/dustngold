import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SessionProvider from "@/components/SessionProvider"
import QueryProvider from "@/components/QueryProvider"
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Navbar } from "@/components/navbar"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dust & Gold - Discover Hidden Gems",
  description: "Discover and share hidden gems and forgotten treasures across music, books, movies, and more.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <QueryProvider>
        <SidebarProvider>
          <html lang="en" className="h-full">
            <body
              className={`${inter.variable} antialiased flex bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white min-h-screen h-full bg-fixed`}
            >
              <div className="flex flex-col w-full">
                <Navbar />
                <main className="flex-1 w-full relative">
                  {/* Background pattern overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
                  <div className="relative z-10">{children}</div>
                </main>
              </div>
              <Toaster richColors position="top-right" />
            </body>
          </html>
        </SidebarProvider>
      </QueryProvider>
    </SessionProvider>
  )
}
