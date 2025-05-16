import type { Metadata } from "next"
import { WalletProvider } from "@/hooks/use-wallet"
import { AdminPage } from "@/components/admin-page"

export const metadata: Metadata = {
  title: "Admin | BareBTC Lending",
  description: "Admin panel for BareBTC lending platform",
}

export default function Admin() {
  return (
    <WalletProvider>
      <AdminPage />
    </WalletProvider>
  )
}
