import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNavbar } from "@/components/mobile-navbar"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/hooks/use-wallet"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BareBTC Lending",
  description: "A DeFi lending platform for Bitcoin",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width"/>
      <body className={inter.className}>
        <WalletProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
            <SidebarProvider>
              <div className="flex min-h-screen min-w-full">
                {/* Desktop Sidebar */}
                <AppSidebar />
                {/* Main Content */}
                <main className="flex-1 grid-bg relative">
                  {/* Mobile Navbar */}
                  <MobileNavbar />
                  {/* Page Content with padding for mobile navbar */}
                  <div className="md:pt-0 pt-16">{children}</div>
                </main>
              </div>
              <Toaster />
            </SidebarProvider>
          </ThemeProvider>
        </WalletProvider>
      </body>
    </html>
  )
}