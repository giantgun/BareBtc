import type { Metadata } from "next";
import { WalletProvider } from "@/hooks/use-wallet";
import { DashboardPage } from "@/components/dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard | BareBTC Lending",
  description: "Your BareBTC lending dashboard",
};

export default function Home() {
  return (
    <WalletProvider>
      <DashboardPage />
    </WalletProvider>
  );
}
