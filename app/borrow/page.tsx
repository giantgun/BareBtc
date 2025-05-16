import type { Metadata } from "next"
import { WalletProvider } from "@/hooks/use-wallet"
import { BorrowPage } from "@/components/borrow-page"

export const metadata: Metadata = {
  title: "Borrow | BareBTC Lending",
  description: "Borrow sBTC with your credit score",
}

export default function Borrow() {
  return (
    <WalletProvider>
      <BorrowPage />
    </WalletProvider>
  )
}
