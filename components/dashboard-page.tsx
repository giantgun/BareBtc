"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/use-wallet";
import { ConnectWallet } from "@/components/connect-wallet";
import { CreditScoreGauge } from "@/components/credit-score-gauge";
import { ActiveLoanCard } from "@/components/active-loan-card";
import { WithdrawCard } from "@/components/withdraw-card";
import {
  Cl,
  cvToJSON,
  cvToValue,
  fetchCallReadOnlyFunction,
  ResponseOkCV,
  TupleCV,
} from "@stacks/transactions";
import { useToast } from "@/hooks/use-toast";

export function DashboardPage() {
  const {
    connected,
    address,
    balance,
    activeLoan,
    accountData,
    creditScore,
    reload,
    loanElgibility,
    poolContractAdrress,
    poolContractName,
    lenderInfo,
    poolInfo,
    timePerBlock,
    isLoading,
  } = useWallet();
  const router = useRouter();
  const [userType, setUserType] = useState<"borrower" | "lender" | null>(null);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const { toast } = useToast();
  const currentBlockHeight =
    (lenderInfo.timeInPool * 60 * 60 * 24) / timePerBlock +
    lenderInfo.lockedBlock;

  useEffect(() => {
    if (connected && !isLoading) {
      setHasActiveLoan(activeLoan.amount > 0);

      setUserType(Math.random() > 0.5 ? "borrower" : "lender");
    }
  }, [connected, isLoading]);

  if (!connected) {
    return <ConnectWallet />;
  }

  const repaymentScore = () => {
    if (accountData.onTimeLoans > 0) {
      if (accountData.totalLoans < 5) {
        return (accountData.onTimeLoans * 700) / (accountData.totalLoans + 5);
      } else {
        return (accountData.onTimeLoans * 700) / accountData.totalLoans;
      }
    } else {
      return 0;
    }
  };

  const handleWithdraw = () => {
    setDepositAmount(0);
  };

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bitcoin-gradient">Dashboard</h1>
        <p className="text-muted-foreground hidden md:block">
          Welcome back, {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>

      {/* Wallet Balance Card - Now Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">sBTC Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold glow-text">
                {balance.toPrecision(3)} sBTC
              </div>
              <Wallet className="h-4 w-4 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">STX Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold glow-text">
                {balance == 0 ? balance.toPrecision(3) : balance} STX
              </div>
              <CreditCard className="h-4 w-4 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={userType || "borrower"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="borrower">Borrower Dashboard</TabsTrigger>
          <TabsTrigger value="lender">Lender Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="borrower" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="web3-card web3-card-highlight">
              <CardHeader>
                <CardTitle>Credit Score Analysis</CardTitle>
                <CardDescription>Your current borrowing power</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <CreditScoreGauge score={creditScore} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {creditScore < 300
                    ? "Poor"
                    : creditScore < 700
                      ? "Good"
                      : "Excellent"}{" "}
                  credit score
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/borrow")}
                  className="web3-input"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>

            {hasActiveLoan ? (
              <ActiveLoanCard />
            ) : (
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Loan Eligibility</CardTitle>
                  <CardDescription>
                    Based on your credit score and average balance over the last
                    3 months
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Maximum Loan Amount
                      </div>
                      <div className="font-bold">
                        {loanElgibility.loanLimit} sBTC
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Interest Rate</div>
                      <div className="font-bold">
                        {loanElgibility.interestRate}%
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Term Length</div>
                      <div className="font-bold">
                        {`${loanElgibility.duration} `}days
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full web3-button"
                    onClick={() => router.push("/borrow")}
                  >
                    Request a Loan
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          <Card className="web3-card">
            <CardHeader>
              <CardTitle>Credit Score Factors</CardTitle>
              <CardDescription>
                What affects your borrowing power
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Repayment History</div>
                    <div className="text-sm font-medium">
                      {Math.floor(repaymentScore())} / 700
                    </div>
                  </div>
                  <Progress
                    value={(Math.floor(repaymentScore()) / 700) * 100}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">On-chain Activity</div>
                    <div className="text-sm font-medium">
                      {creditScore - Math.floor(repaymentScore())} / 300
                    </div>
                  </div>
                  <Progress
                    value={
                      ((creditScore - Math.floor(repaymentScore())) / 300) * 100
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lender" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="web3-card">
              <CardHeader>
                <CardTitle>Lending Pool</CardTitle>
                <CardDescription>Current pool statistics</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Total Pool Size</div>
                    <div className="font-bold">
                      {`${poolInfo.poolSize} `}sBTC
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Current APY</div>
                    <div className="font-bold text-green-500">
                      {(
                        ((poolInfo.contractBalance - poolInfo.poolSize) /
                          (poolInfo.poolSize | 1)) *
                        100
                      ).toPrecision(3)}
                      %
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Your Position</div>
                    <div className="font-bold">
                      {lenderInfo.lenderBalance} sBTC
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full web3-button"
                  onClick={() => router.push("/lend")}
                >
                  Manage Deposits
                </Button>
              </CardFooter>
            </Card>

            {depositAmount > 0 ? (
              <WithdrawCard
                depositAmount={depositAmount}
                onWithdraw={handleWithdraw}
              />
            ) : (
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Lending Performance</CardTitle>
                  <CardDescription>
                    Your earnings and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Current Earnings
                      </div>
                      <div className="font-bold text-green-500">
                        {lenderInfo.lenderPoolBalance -
                          lenderInfo.lenderBalance}{" "}
                        sBTC
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Time in Pool</div>
                      <div className="font-bold">
                        {`${Math.round(lenderInfo.timeInPool)} `}days
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Days left before unlock
                      </div>
                      <div className="font-bold">
                        {lenderInfo.unlockBlock > currentBlockHeight
                          ? `${(timePerBlock * (lenderInfo.unlockBlock - currentBlockHeight)) / (60 * 60 * 24)} `
                          : 0}{" "}
                        days
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    className="rounded-xl w-full"
                    onClick={() => router.push("/lend")}
                  >
                    Deposit
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          <Card className="web3-card">
            <CardHeader>
              <CardTitle>Pool Performance</CardTitle>
              <CardDescription>
                Historical lending pool statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Historical APY chart would appear here</p>
                  <p className="text-sm">Showing 30-day performance</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Average APY: 5.4%
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
