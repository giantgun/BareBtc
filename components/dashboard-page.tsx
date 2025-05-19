"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

import { Loading } from "@/components/ui/loading";
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
import { WithdrawTab } from "@/components/withdraw-tab";

export function DashboardPage() {
  const {
    connected,
    address,
    balance,
    activeLoan,
    accountData,
    creditScore,
    loanElgibility,
    lenderInfo,
    poolInfo,
    timePerBlock,
    currentBlockHeight,
  } = useWallet();
  const router = useRouter();
  const [userType, setUserType] = useState<"borrower" | "lender" | null>(null);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const onTimeLoans = accountData.onTimeLoans || 0;
  const totalLoans = accountData.totalLoans || 0;
  const lenderBalance = lenderInfo.lenderBalance || 0;
  const lenderPoolBalance = lenderInfo.lenderPoolBalance || 0;
  const timeInPool = lenderInfo.timeInPool || 0;
  const unlockBlock = lenderInfo.unlockBlock || 0;

  useEffect(() => {
    if (connected) {
      setHasActiveLoan((activeLoan.amount || 0) > 0);

      setUserType(Math.random() > 0.5 ? "borrower" : "lender");
    }
  }, [connected, activeLoan.amount]);

  if (!connected) {
    return <ConnectWallet />;
  }

  const repaymentScore = () => {
    if (onTimeLoans > 0) {
      if (totalLoans < 5) {
        return (onTimeLoans * 700) / (totalLoans + 5);
      } else {
        return (onTimeLoans * 700) / totalLoans;
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
        <div className="text-muted-foreground hidden md:block">
          {address ? (
            `Welcome back, ${address.slice(0, 6)}...${address.slice(-4)}`
          ) : (
            <Loading variant="dots" size="sm" />
          )}
        </div>
      </div>

      <Card className="web3-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">sBTC Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {balance === null ? (
            <div className="flex items-center justify-between">
              <Loading variant="pulse" size="sm" />
              <div className="h-4 w-4 rounded-full bg-orange-400/30" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold glow-text">
                {balance == 0 ? balance.toPrecision(3) : balance} sBTC
              </div>
              <Wallet className="h-4 w-4 text-orange-400" />
            </div>
          )}
        </CardContent>
      </Card>

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
                {creditScore === null ? (
                  <Loading variant="bitcoin" text="Loading credit score" />
                ) : (
                  <CreditScoreGauge score={creditScore} />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {creditScore === null ? (
                  <div className="w-full flex justify-between">
                    <Loading variant="dots" size="sm" text="Loading" />
                    <div className="h-8 w-24 rounded-md bg-secondary/50" />
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </CardFooter>
            </Card>

            {loanElgibility.loanLimit === null ? (
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Loading Data</CardTitle>
                  <CardDescription>Please wait...</CardDescription>
                </CardHeader>
                <CardContent className="py-6 flex justify-center">
                  <Loading variant="spinner" text="Loading loan information" />
                </CardContent>
              </Card>
            ) : hasActiveLoan ? (
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
              {creditScore === null || loanElgibility.duration === null ? (
                <div className="flex justify-center py-6">
                  <Loading variant="spinner" text="Loading credit factors" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Repayment History
                      </div>
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
                      <div className="text-sm font-medium">
                        On-chain Activity
                      </div>
                      <div className="text-sm font-medium">
                        {creditScore - Math.floor(repaymentScore())} / 300
                      </div>
                    </div>
                    <Progress
                      value={
                        ((creditScore - Math.floor(repaymentScore())) / 300) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              )}
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
                {poolInfo.poolSize === null ||
                poolInfo.contractBalance === null ? (
                  <div className="flex justify-center">
                    <Loading variant="spinner" text="Loading pool data" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Total Pool Size</div>
                      <div className="font-bold">
                        {`${poolInfo.poolSize} `}sBTC
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Current APY</div>
                      <div
                        className={
                          poolInfo.contractBalance > poolInfo.poolSize
                            ? "font-bold text-green-500"
                            : "font-bold text-red-500"
                        }
                      >
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
                      <div className="font-bold">{lenderBalance} sBTC</div>
                    </div>
                  </div>
                )}
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

            {lenderInfo.lenderBalance === null || currentBlockHeight === 0 ? (
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Loading Data</CardTitle>
                  <CardDescription>Please wait...</CardDescription>
                </CardHeader>
                <CardContent className="py-6 flex justify-center">
                  <Loading variant="bitcoin" text="Loading lending data" />
                </CardContent>
              </Card>
            ) : depositAmount > 0 ? (
              <WithdrawTab
                depositAmount={depositAmount}
                onWithdraw={handleWithdraw}
                depositPoolBalance={lenderInfo.lenderPoolBalance || 0}
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
                      <div
                        className={
                          lenderPoolBalance > lenderBalance
                            ? "font-bold text-green-500"
                            : "font-bold text-red-500"
                        }
                      >
                        {lenderPoolBalance - lenderBalance} sBTC
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Time in Pool</div>
                      <div className="font-bold">
                        {`${Math.round(timeInPool)} `}days
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Days left before unlock
                      </div>
                      <div className="font-bold">
                        {unlockBlock > currentBlockHeight
                          ? `${(timePerBlock * (unlockBlock - currentBlockHeight)) / (60 * 60 * 24)} `
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
