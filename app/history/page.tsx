import type { Metadata } from "next"
import { WalletProvider } from "@/hooks/use-wallet"
import { HistoryPage } from "@/components/history-page"

export const metadata: Metadata = {
  title: "History | BareBTC Lending",
  description: "Transaction history for BareBTC lending platform",
}

export default function History() {
  return (
    <WalletProvider>
      <HistoryPage />
    </WalletProvider>
  )
}
