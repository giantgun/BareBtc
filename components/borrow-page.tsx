"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ArrowRight, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWallet } from "@/hooks/use-wallet";
import { ConnectWallet } from "@/components/connect-wallet";
import { CreditScoreGauge } from "@/components/credit-score-gauge";
import { ActiveLoanCard } from "@/components/active-loan-card";
import { Loading } from "./ui/loading";
import { useRouter } from "next/navigation";

export function BorrowPage() {
  const {
    connected,
    address,
    loanElgibility,
    creditScore,
    activeLoan,
    borrow,
    poolInfo,
    reload,
  } = useWallet();
  const { toast }: any = useToast();
  const router = useRouter();
  const [amount, setAmount] = useState<number[]>([0]);
  const [borrowing, setBorrowing] = useState(false);
  const [step, setStep] = useState(1);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);

  const maxLoanAmount = loanElgibility.loanLimit || 0;
  const interestRate = loanElgibility.interestRate;
  const loanAmount = activeLoan.amount || 0;
  const contractBalance = poolInfo.contractBalance || 0;

  useEffect(() => {
    setHasActiveLoan(loanAmount > 0);
  }, [activeLoan.amount]);

  const handleBorrow = async () => {
    if (amount[0] > contractBalance) {
      toast({
        title: "Insufficient Pool Balance",
        description: `${amount[0]}sBTC is not available at this time.`,
        variant: "destructive",
      });
      return;
    }
    setBorrowing(true);
    try {
      await borrow(amount[0] * 100000000);
      toast({
        title: "Loan request Accepted",
        description: `The loan of ${amount[0]}sBTC has been accepted succesfully!`,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reload();
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setBorrowing(false);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  if (!connected) {
    return <ConnectWallet />;
  }

  return (
    <div className="container py-6 space-y-8">
      <div
        className="flex flex-col gap-2"
        role="region"
        aria-labelledby="borrow-heading"
      >
        <h1 id="borrow-heading" className="text-3xl font-bold bitcoin-gradient">
          Borrow sBTC
        </h1>
        <p className="text-muted-foreground">
          Request a loan based on your credit score
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {loanElgibility.loanLimit === null ? (
            <Card
              className="web3-card"
              role="status"
              aria-busy="true"
              aria-live="polite"
            >
              <CardHeader>
                <CardTitle>Loading Loan Information</CardTitle>
                <CardDescription>
                  Please wait while we fetch your loan details
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 flex justify-center">
                <div className="sr-only">Loading loan information...</div>
                <Loading
                  variant="spinner"
                  text="Loading loan information"
                  aria-hidden="true"
                />
              </CardContent>
            </Card>
          ) : hasActiveLoan ? (
            <ActiveLoanCard />
          ) : (
            <Card className="web3-card">
              <CardHeader>
                <CardTitle id="loan-request-title">Request a Loan</CardTitle>
                <CardDescription aria-live="polite">
                  {step === 1
                    ? "Select your loan amount"
                    : step === 2
                      ? "Review loan terms"
                      : "Confirm your loan request"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="amount">Loan Amount (sBTC)</Label>
                        <div className="text-sm text-muted-foreground">
                          Max: {maxLoanAmount} sBTC
                        </div>
                      </div>
                      <form
                        className="flex items-center space-x-4"
                        role="group"
                        aria-labelledby="amount"
                      >
                        <Slider
                          id="amount"
                          max={maxLoanAmount}
                          step={0.00001}
                          value={amount}
                          onValueChange={(value: number[]) => setAmount(value)}
                          disabled={maxLoanAmount <= 0}
                          aria-valuetext={`${amount[0]} sBTC`}
                        />
                        <Input
                          type="number"
                          value={amount[0]}
                          onChange={(e) => setAmount([Number(e.target.value)])}
                          max={maxLoanAmount}
                          step={0.00000001}
                          className="w-24"
                          disabled={maxLoanAmount == 0}
                          aria-label="Loan amount input in sBTC"
                        />
                      </form>
                    </div>

                    <Alert role="note">
                      <AlertTitle>Loan Terms</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-2 text-sm space-y-1">
                          <li>Interest Rate: {interestRate?.toFixed(1)}%</li>
                          <li>Term Length: {loanElgibility.duration} days</li>
                          <li>
                            Total Repayment:{" "}
                            {(
                              amount[0] *
                              (1 + interestRate! / 100)
                            ).toPrecision(3)}{" "}
                            sBTC
                          </li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Loan Amount:
                        </span>
                        <span className="font-bold">
                          {amount[0].toFixed(4)} sBTC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Interest Rate:
                        </span>
                        <span>{interestRate?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Term Length:
                        </span>
                        <span>{`${loanElgibility.duration} `}days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Total Repayment:
                        </span>
                        <span className="font-bold">
                          {(amount[0] * (1 + interestRate! / 100)).toPrecision(
                            3,
                          )}{" "}
                          sBTC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Due Date:</span>
                        <span>
                          {new Date(
                            Date.now() +
                              loanElgibility.duration! * 24 * 60 * 60 * 1000,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Alert variant="destructive" role="alert">
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Failure to repay your loan on time will negatively
                        impact your credit score.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Wallet Address:
                        </span>
                        <span className="font-mono text-xs">
                          {address?.slice(0, 10)}...{address?.slice(-10)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Loan Amount:
                        </span>
                        <span className="font-bold">
                          {amount[0].toPrecision(3)} sBTC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Total Repayment:
                        </span>
                        <span className="font-bold">
                          {(amount[0] * (1 + interestRate! / 100)).toPrecision(
                            3,
                          )}{" "}
                          sBTC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Due Date:</span>
                        <span>
                          {new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      By submitting this request, you agree to the terms and
                      conditions of the Bitcoin DeFi lending protocol.
                    </div>

                    <Alert
                      variant="default"
                      className="border-green-500 bg-green-500/10"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                      <AlertTitle>Ready to Submit</AlertTitle>
                      <AlertDescription>
                        Your loan request is ready to be submitted to the
                        blockchain.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="web3-input"
                    aria-label="Go back to previous step"
                  >
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <Button
                    onClick={nextStep}
                    className="web3-button"
                    disabled={
                      maxLoanAmount == 0 ||
                      amount[0] > maxLoanAmount ||
                      amount[0] == 0
                    }
                    aria-label="Proceed to next step"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleBorrow}
                    disabled={borrowing}
                    className="web3-button"
                    aria-label="Submit your loan request to the blockchain"
                  >
                    {borrowing ? "Processing..." : "Submit Loan Request"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </div>

        <div>
          <Card
            className="web3-card web3-card-highlight"
            role="region"
            aria-labelledby="credit-score-title"
          >
            <CardHeader>
              <CardTitle id="credit-score-title">Credit Score</CardTitle>
              <CardDescription>Your borrowing power</CardDescription>
            </CardHeader>

            <CardContent className="flex justify-center py-6">
              {creditScore === null ? (
                <>
                  <div className="sr-only" role="status" aria-live="polite">
                    Loading credit score...
                  </div>
                  <Loading
                    variant="bitcoin"
                    text="Loading credit score"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <CreditScoreGauge
                  score={creditScore}
                  aria-label={`Credit score: ${creditScore}`}
                />
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {interestRate === null ? (
                <>
                  <div className="sr-only" role="status" aria-live="polite">
                    Loading loan eligibility data...
                  </div>
                  <Loading
                    variant="dots"
                    size="sm"
                    text="Loading eligibility data"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <div
                  className="w-full text-sm space-y-2"
                  aria-label="Loan eligibility details"
                >
                  <div className="flex justify-between">
                    <span>Max Loan Amount:</span>
                    <span className="font-medium">
                      {maxLoanAmount.toPrecision(2)} sBTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-medium">
                      {interestRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
