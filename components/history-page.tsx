"use client"

import { ArrowDown, ArrowUp, Check, Clock, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/hooks/use-wallet"
import { ConnectWallet } from "@/components/connect-wallet"

// Mock transaction data
const transactions = [
  {
    id: "tx1",
    type: "deposit",
    amount: 0.5,
    status: "confirmed",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    txId: "0x1a2b3c4d5e6f7g8h9i0j",
  },
  {
    id: "tx2",
    type: "borrow",
    amount: 0.25,
    status: "confirmed",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    txId: "0x2b3c4d5e6f7g8h9i0j1a",
  },
  {
    id: "tx3",
    type: "repay",
    amount: 0.2625,
    status: "confirmed",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    txId: "0x3c4d5e6f7g8h9i0j1a2b",
  },
  {
    id: "tx4",
    type: "withdraw",
    amount: 0.1,
    status: "pending",
    date: new Date(),
    txId: "0x4d5e6f7g8h9i0j1a2b3c",
  },
]

export function HistoryPage() {
  const { connected } = useWallet()

  if (!connected) {
    return <ConnectWallet />
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bitcoin-gradient">Transaction History</h1>
        <p className="text-muted-foreground">View your lending and borrowing activity</p>
      </div>

      <Card className="web3-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your recent activity on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/30 backdrop-blur-sm bg-card/50 hover:bg-card/80 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      tx.type === "deposit"
                        ? "bg-green-500/20"
                        : tx.type === "withdraw"
                          ? "bg-orange-500/20"
                          : tx.type === "borrow"
                            ? "bg-blue-500/20"
                            : "bg-purple-500/20"
                    }`}
                  >
                    {tx.type === "deposit" && <ArrowDown className={`h-5 w-5 text-green-500`} />}
                    {tx.type === "withdraw" && <ArrowUp className={`h-5 w-5 text-orange-500`} />}
                    {tx.type === "borrow" && <ArrowDown className={`h-5 w-5 text-blue-500`} />}
                    {tx.type === "repay" && <ArrowUp className={`h-5 w-5 text-purple-500`} />}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{tx.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {tx.date.toLocaleDateString()} at {tx.date.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="font-medium">
                    {tx.type === "deposit" || tx.type === "repay" ? "-" : "+"}
                    {tx.amount.toFixed(4)} sBTC
                  </div>
                  <div className="flex items-center text-xs">
                    {tx.status === "confirmed" ? (
                      <>
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500">Confirmed</span>
                      </>
                    ) : tx.status === "pending" ? (
                      <>
                        <Clock className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-yellow-500">Pending</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-red-500">Failed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="outline" className="web3-input">
              Load More
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="web3-card">
          <CardHeader>
            <CardTitle>Lending Activity</CardTitle>
            <CardDescription>Your deposits and withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Deposited</span>
                <span className="font-bold">0.85 sBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Withdrawn</span>
                <span className="font-bold">0.35 sBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Current Balance</span>
                <span className="font-bold">0.50 sBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Earned</span>
                <span className="font-bold text-green-500 glow-text">0.0342 sBTC</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader>
            <CardTitle>Borrowing Activity</CardTitle>
            <CardDescription>Your loans and repayments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Borrowed</span>
                <span className="font-bold">0.75 sBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Repaid</span>
                <span className="font-bold">0.7875 sBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Active Loans</span>
                <span className="font-bold">0.00 sBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Interest Paid</span>
                <span className="font-bold text-orange-500 glow-text">0.0375 sBTC</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
