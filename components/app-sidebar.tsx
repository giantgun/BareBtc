"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  CreditCard,
  Home,
  Landmark,
  LogOut,
  Settings,
  Shield,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";

export function AppSidebar() {
  const pathname = usePathname();
  const { connected, disconnectFromWallet, connectToWallet } = useWallet();
  const { isMobile, setOpenMobile } = useSidebar();

  const isActive = (path: string) => pathname === path;

  const handleConnect = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    connectToWallet();
  };

  // Function to handle link clicks
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Function to handle disconnectFromWallet with sidebar closing
  const handleDisconnect = () => {
    disconnectFromWallet();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar role="navigation" aria-label="Main sidebar">
      <SidebarHeader className="flex items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/20"
            aria-hidden="true"
          >
            <Landmark className="h-4 w-4 text-white" />
          </div>
          <div className="font-bold bitcoin-gradient" aria-label="BareBTC logo">
            BareBTC
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sr-only">Navigation</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu role="menu">
              <SidebarMenuItem role="none">
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/")}
                  role="menuitem"
                >
                  <Link href="/" onClick={handleLinkClick}>
                    <Home className="h-4 w-4" aria-hidden="true" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem role="none">
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/borrow")}
                  role="menuitem"
                >
                  <Link href="/borrow" onClick={handleLinkClick}>
                    <CreditCard className="h-4 w-4" aria-hidden="true" />
                    <span>Borrow</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem role="none">
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/lend")}
                  role="menuitem"
                >
                  <Link href="/lend" onClick={handleLinkClick}>
                    <Landmark className="h-4 w-4" aria-hidden="true" />
                    <span>Lend</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
          {connected ? (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleDisconnect}
              aria-label="Disconnect wallet"
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Disconnect Wallet
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleConnect}
              aria-label="Connect wallet"
            >
              <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
              Connect Wallet
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
