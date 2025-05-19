"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Info } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWallet } from "@/hooks/use-wallet";
import { ConnectWallet } from "@/components/connect-wallet";
import { WithdrawTab } from "@/components/withdraw-tab";
import {
  Cl,
  cvToJSON,
  fetchCallReadOnlyFunction,
  Pc,
  PostCondition,
  ResponseOkCV,
  TupleCV,
} from "@stacks/transactions";
import { request } from "@stacks/connect";
import { Loading } from "./ui/loading";

export function LendPage() {
  const {
    connected,
    balance,
    lenderInfo,
    poolInfo,
    poolContractAdrress,
    poolContractName,
    sbtcTokenContractAddress,
    address,
  } = useWallet();
  const router = useRouter();
  const { toast } = useToast();

  const [depositAmount, setDepositAmount] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit");

  const currentDeposit = lenderInfo.lenderBalance || 0;
  const lenderPoolBalance = lenderInfo.lenderPoolBalance || 0;
  const poolSize = poolInfo.poolSize || 0;
  const contractBalance = poolInfo.contractBalance || 0;
  const poolApy = ((contractBalance - poolSize) / (poolSize || 1)) * 100;

  const handleDepositAmountChange = (value: number[]) => {
    setDepositAmount(value[0]);
  };

  const handleDeposit = async () => {
    if (depositAmount > balance!) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${balance!.toFixed(4)} sBTC available.`,
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const condition = {
        type: "ft-postcondition",
        address: address, // Stacks c32-encoded, with optional contract name suffix
        condition: "eq",
        asset: `${sbtcTokenContractAddress}.sbtc-token::sbtc-token`, // Stacks c32-encoded address, with contract name suffix, with asset suffix
        amount: `${Math.round(depositAmount * 100000000)}`, // `bigint` compatible, amount in lowest integer denomination of fungible token
      } as PostCondition;

      await request("stx_callContract", {
        contract: `${poolContractAdrress}.${poolContractName}`,
        functionName: "lend",
        functionArgs: [Cl.uint(Math.round(depositAmount * 100000000))],
        network: "testnet",
        postConditions: [condition],
        postConditionMode: "deny",
      });

      toast({
        title: "Deposit Successful",
        description: `Your deposit of ${depositAmount} sBTC was completed successfully!`,
      });

      // Navigate back to dashboard
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!connected) {
    return <ConnectWallet />;
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bitcoin-gradient">Lending Pool</h1>
        <p className="text-muted-foreground">
          Deposit your sBTC to earn interest
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="web3-card">
            <CardHeader>
              <Tabs
                defaultValue={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-secondary/50 backdrop-blur-sm">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>

                <TabsContent value="deposit" className="mt-4">
                  <CardTitle>Deposit sBTC</CardTitle>
                  <CardDescription>Earn on your deposits</CardDescription>
                </TabsContent>

                <TabsContent value="withdraw" className="mt-4">
                  <CardTitle>Withdraw sBTC</CardTitle>
                  <CardDescription>
                    Withdraw your deposited sBTC
                  </CardDescription>
                </TabsContent>
              </Tabs>
            </CardHeader>

            {balance === null ? (
              <CardContent className="py-12 flex justify-center">
                <Loading variant="spinner" text="Loading lending pool data" />
              </CardContent>
            ) : (
              <Tabs value={activeTab}>
                <TabsContent value="deposit" className="space-y-4">
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="deposit-amount">
                            Deposit Amount (sBTC)
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            Balance: {balance!.toPrecision(3)} sBTC
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Slider
                            id="deposit-amount"
                            max={balance!}
                            min={1}
                            step={0.1}
                            value={[depositAmount]}
                            onValueChange={handleDepositAmountChange}
                          />
                          <Input
                            type="number"
                            value={depositAmount}
                            onChange={(e) =>
                              setDepositAmount(Number(e.target.value))
                            }
                            max={balance!}
                            min={0.01}
                            step={0.01}
                            className="w-24"
                          />
                        </div>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Deposit Information</AlertTitle>
                        <AlertDescription>
                          <div className="mt-2 text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Current pool APY:</span>
                              <span
                                className={
                                  contractBalance > poolSize
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {poolApy.toPrecision(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current pool balance:</span>
                              <span>{currentDeposit.toPrecision(3)} sBTC</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pool size:</span>
                              <span>{poolSize.toPrecision(3)} sBTC</span>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full web3-button"
                      onClick={handleDeposit}
                      disabled={
                        processing ||
                        depositAmount < 1 ||
                        depositAmount > balance!
                      }
                    >
                      {processing ? (
                        "Processing..."
                      ) : (
                        <>
                          <ArrowUp className="mr-2 h-4 w-4" />
                          Deposit sBTC
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-4">
                  <WithdrawTab
                    depositAmount={currentDeposit}
                    depositPoolBalance={lenderPoolBalance}
                    onWithdraw={() => router.push("/")}
                  />
                </TabsContent>
              </Tabs>
            )}
          </Card>
        </div>

        <div>
          <Card className="web3-card web3-card-highlight">
            <CardHeader>
              <CardTitle>Pool Statistics</CardTitle>
              <CardDescription>
                Current lending pool information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {poolInfo.poolSize === null ? (
                <div className="flex justify-center py-6">
                  <Loading variant="bitcoin" text="Loading pool stats" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center py-4">
                    <div
                      className={`text-4xl font-bold glow-text ${contractBalance > poolSize ? "text-green-500" : "text-red-500"}`}
                    >
                      {poolApy.toPrecision(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current APY
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        Total Pool Size:
                      </span>
                      <span className="font-bold">
                        {poolSize.toPrecision(3)} sBTC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Your Deposit:</span>
                      <span className="font-bold">
                        {currentDeposit.toPrecision(3)} sBTC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Your Share:</span>
                      <span className="font-bold">
                        {(currentDeposit / (poolSize || 1)) * 100}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full web3-input"
                onClick={() => router.push("/history")}
              >
                View Transaction History
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
