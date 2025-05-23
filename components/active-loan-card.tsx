"use client";

import { useState } from "react";
import { ArrowUp, Clock } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { useRouter } from "next/navigation";

export function ActiveLoanCard() {
  const { toast } = useToast();
  const {
    balance,
    activeLoan,
    timePerBlock,
    currentBlockHeight,
    repay,
    address,
    reload,
  } = useWallet();
  const [repaying, setRepaying] = useState(false);

  const loanAmount = activeLoan.amount;
  const router = useRouter();
  const interestRate = (activeLoan.interestRate || 0) / 100;
  const totalDue = activeLoan.totalDue;
  const daysRemaining = Math.floor(
    (timePerBlock * (activeLoan.dueBlock!! - currentBlockHeight)) /
      (24 * 60 * 60),
  );
  const totalDays =
    (timePerBlock * (activeLoan.dueBlock!! - activeLoan.issuedBlock!)) /
    (24 * 60 * 60);
  const progress =
    activeLoan.dueBlock! < currentBlockHeight
      ? 100
      : ((totalDays - daysRemaining) / totalDays) * 100;

  const handleRepay = async () => {
    if (balance! < totalDue!) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${totalDue!.toPrecision(3)} sBTC to repay this loan.`,
        variant: "destructive",
      });
      return;
    }

    setRepaying(true);

    try {
      await repay(Math.round(totalDue! * 100000000), address!);
      toast({
        title: "Repayment Successful",
        description: `Your have paid your loan of ${totalDue} sBTC successfully!`,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reload();
      router.push("/");
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to repay loan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRepaying(false);
    }
  };

  return (
    <Card
      className="web3-card"
      role="region"
      aria-labelledby="active-loan-title"
    >
      <CardHeader>
        <CardTitle id="active-loan-title">Active Loan</CardTitle>
        <CardDescription>
          {activeLoan.dueBlock! < currentBlockHeight
            ? "You have an outstanding loan!"
            : `Due in ${daysRemaining} days`}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Loan Amount</div>
            <div className="font-bold" aria-label={`${loanAmount} sBTC`}>
              {loanAmount!.toPrecision(3)} sBTC
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Interest Rate</div>
            <div
              className="font-bold"
              aria-label={`${(interestRate * 100).toFixed(1)} percent`}
            >
              {(interestRate * 100).toFixed(1)}%
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Total Due</div>
            <div
              className="font-bold text-orange-500 glow-text"
              aria-label={`${totalDue} sBTC`}
            >
              {totalDue!.toPrecision(3)} sBTC
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                <span>Loan Term Progress</span>
              </div>
              <div className="text-xs font-medium">
                {activeLoan.dueBlock! < currentBlockHeight
                  ? "You have not paid your outstanding loan"
                  : `${daysRemaining} days left`}
              </div>
            </div>

            <Progress
              value={progress}
              className="h-2"
              aria-label="Loan term progress bar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full web3-button"
          onClick={handleRepay}
          disabled={repaying}
          aria-label={repaying ? "Processing repayment" : "Repay loan"}
        >
          {repaying ? (
            "Processing..."
          ) : (
            <>
              <ArrowUp className="mr-2 h-4 w-4" aria-hidden="true" />
              Repay Loan
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
