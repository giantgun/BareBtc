"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

export function WithdrawCard({
  depositAmount = 0,
  onWithdraw,
}: {
  depositAmount: number;
  onWithdraw?: () => void;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(
    depositAmount > 0 ? depositAmount / 2 : 0,
  );
  const [withdrawing, setWithdrawing] = useState(false);

  const handleAmountChange = (value: number[]) => {
    setAmount(value[0]);
  };

  const handleWithdraw = async () => {
    if (amount <= 0 || amount > depositAmount) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }

    setWithdrawing(true);

    try {
      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Withdrawal Successful",
        description: `Successfully withdrew ${amount.toFixed(4)} sBTC.`,
      });

      // Call the onWithdraw callback if provided
      onWithdraw?.();
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to withdraw. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <Card className="web3-card">
      <CardHeader>
        <CardTitle>Withdraw sBTC</CardTitle>
        <CardDescription>
          Withdraw your deposited sBTC from the lending pool
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">
              Available to Withdraw
            </div>
            <div className="text-3xl font-bold glow-text">
              {depositAmount.toFixed(4)} sBTC
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Withdraw Amount</div>
            <div className="text-sm text-muted-foreground">
              {((amount / depositAmount) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Slider
              max={depositAmount}
              min={0}
              step={0.001}
              value={[amount]}
              onValueChange={handleAmountChange}
              disabled={withdrawing || depositAmount <= 0}
            />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={depositAmount}
              min={0}
              step={0.001}
              className="w-24"
              disabled={withdrawing || depositAmount <= 0}
            />
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Remaining Balance After Withdrawal</span>
            <span className="font-medium">
              {(depositAmount - amount).toFixed(4)} sBTC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Transaction Fee</span>
            <span className="font-medium">0.0001 sBTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">You Will Receive</span>
            <span className="font-bold">
              {(amount - 0.0001).toFixed(4)} sBTC
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full web3-button"
          onClick={handleWithdraw}
          disabled={withdrawing || amount <= 0 || amount > depositAmount}
        >
          {withdrawing ? (
            "Processing..."
          ) : (
            <>
              <ArrowDown className="mr-2 h-4 w-4" />
              Withdraw sBTC
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
