import type { Metadata } from "next"
import { WalletProvider } from "@/hooks/use-wallet"
import { LendPage } from "@/components/lend-page"

export const metadata: Metadata = {
  title: "Lend | BareBTC Lending",
  description: "Lend your sBTC and earn interest",
}

export default function Lend() {
  return (
    <WalletProvider>
      <LendPage />
    </WalletProvider>
  )
}
