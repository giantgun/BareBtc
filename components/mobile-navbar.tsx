"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Landmark, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useWallet } from "@/hooks/use-wallet";

export function MobileNavbar() {
  const { connected, address } = useWallet();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll events to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up or at the top
      if (currentScrollY <= 10 || currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      // Hide navbar when scrolling down (beyond 10px)
      else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-md border-b border-border/30 soft-shadow">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Go to homepage"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/20"
            role="img"
            aria-label="BareBTC Logo"
          >
            <Landmark className="h-4 w-4 text-white" />
          </div>
          <div className="font-bold bitcoin-gradient">BareBTC</div>
        </Link>

        <div className="flex items-center gap-3">
          {connected && (
            <div
              className="text-xs text-right truncate text-muted-foreground px-2 py-1 rounded-full bg-secondary/30"
              aria-label={`Connected wallet address: ${address}`}
            >
              {address?.slice(0, 4)}...{address?.slice(-4)}
            </div>
          )}

          <SidebarTrigger>
            <button
              className="p-2 rounded-full bg-secondary/50 hover:bg-secondary/70 transition-colors soft-glow text-orange-400"
              aria-label="Open menu"
            >
              <Menu className="h-7 w-7" />
              <span className="sr-only">Toggle Menu</span>
            </button>
          </SidebarTrigger>
        </div>
      </div>
    </div>
  );
}
