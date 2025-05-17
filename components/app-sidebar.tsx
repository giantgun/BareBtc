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
    <Sidebar>
      <SidebarHeader className="flex items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/20">
            <Landmark className="h-4 w-4 text-white" />
          </div>
          <div className="font-bold bitcoin-gradient">BareBTC</div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link href="/" onClick={handleLinkClick}>
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/borrow")}>
                  <Link href="/borrow" onClick={handleLinkClick}>
                    <CreditCard className="h-4 w-4" />
                    <span>Borrow</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/lend")}>
                  <Link href="/lend" onClick={handleLinkClick}>
                    <Landmark className="h-4 w-4" />
                    <span>Lend</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin")}>
                  <Link href="/admin" onClick={handleLinkClick}>
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")}>
                  <Link href="/settings" onClick={handleLinkClick}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {connected ? (
          <div className="p-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleDisconnect}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="p-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleConnect}
              asChild
            >
              <div>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </div>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
