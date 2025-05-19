"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { request } from "@stacks/connect";
import { Cl, PostCondition } from "@stacks/transactions";

export function WithdrawTab({
  depositAmount,
  depositPoolBalance,
  onWithdraw,
}: {
  depositAmount: number;
  depositPoolBalance: number;
  onWithdraw?: () => void;
}) {
  const { toast } = useToast();
  const {
    poolContractAdrress,
    sbtcTokenContractAddress,
    poolContractName,
    reload,
  } = useWallet();
  const [amount, setAmount] = useState(
    depositAmount > 0 ? depositAmount / 2 : 0,
  );
  const [withdrawing, setWithdrawing] = useState(false);

  const currentAllocation = () => {
    if (depositAmount > depositPoolBalance) {
      return depositAmount;
    } else {
      return depositPoolBalance;
    }
  };

  const handleAmountChange = (value: number[]) => {
    setAmount(value[0]);
  };

  const handleWithdraw = async () => {
    if (amount <= 0 || amount > currentAllocation()) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }

    setWithdrawing(true);

    try {
      const condition = {
        type: "ft-postcondition",
        address: `${poolContractAdrress}.${poolContractName}`, // Stacks c32-encoded, with optional contract name suffix
        condition: "eq",
        asset: `${sbtcTokenContractAddress}.sbtc-token::sbtc-token`, // Stacks c32-encoded address, with contract name suffix, with asset suffix
        amount: `${Math.round(amount * 100000000)}`, // `bigint` compatible, amount in lowest integer denomination of fungible token
      } as PostCondition;

      await request("stx_callContract", {
        contract: `${poolContractAdrress}.${poolContractName}`,
        functionName: "withdraw",
        functionArgs: [Cl.uint(Math.round(amount * 100000000))],
        network: "testnet",
        postConditions: [condition],
        postConditionMode: "deny",
      });

      toast({
        title: "Withdrawal Successful",
        description: `Your withdrawal of ${amount}sBTC was successful! Your new balance is ${currentAllocation() - amount}sBTC`,
      });

      // Call the onWithdraw callback if provided
      onWithdraw?.();
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Withdraw Amount</div>
            <div className="text-sm text-muted-foreground">
              Max: {`${currentAllocation().toPrecision(3)}`}sBTC
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Slider
              max={depositAmount}
              min={0}
              step={depositAmount / 100}
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
              step={depositAmount / 100}
              className="w-24"
              disabled={withdrawing || depositAmount <= 0}
            />
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Balance After Withdrawal</span>
            <span className="font-medium">
              {(currentAllocation() - amount).toPrecision(3)} sBTC
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full web3-button"
          onClick={handleWithdraw}
          disabled={withdrawing || amount <= 0 || amount > currentAllocation()}
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
    </div>
  );
}
