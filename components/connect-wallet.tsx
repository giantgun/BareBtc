"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

export function ConnectWallet() {
  const { connectToWallet, connecting } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectToWallet();
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card
        className="w-full max-w-md web3-card web3-card-highlight"
        role="region"
        aria-labelledby="wallet-connect-title"
      >
        <CardHeader className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/20"
            aria-hidden="true"
          >
            <Landmark className="h-8 w-8 text-white" />
          </div>
          <CardTitle
            id="wallet-connect-title"
            className="text-2xl bitcoin-gradient"
          >
            Connect Your Wallet
          </CardTitle>
          <CardDescription>
            Connect your Stacks wallet to access the BareBtc lending platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-center text-sm text-muted-foreground">
            Click the button below to connect with your preferred Stacks wallet
          </p>

          <Button
            className="w-full h-14 web3-button pulse-on-hover"
            onClick={handleConnect}
            disabled={connecting || isConnecting}
            aria-busy={connecting || isConnecting}
            aria-label="Connect your Stacks wallet"
          >
            {connecting || isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>

          <div
            className="flex items-center gap-2 justify-center"
            aria-hidden="true"
          >
            <div className="h-px flex-1 bg-border/50"></div>
            <span className="text-xs text-muted-foreground">
              Supported wallets
            </span>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>

          <ul
            className="flex justify-center gap-4"
            aria-label="Supported wallets"
          >
            <li className="flex flex-col items-center" aria-label="Hiro Wallet">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center soft-shadow">
                <img
                  src="/placeholder.svg?height=24&width=24"
                  alt="Hiro Wallet logo"
                  className="h-6 w-6"
                />
              </div>
              <span className="text-xs mt-1">Hiro</span>
            </li>

            <li
              className="flex flex-col items-center"
              aria-label="Xverse Wallet"
            >
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center soft-shadow">
                <img
                  src="/placeholder.svg?height=24&width=24"
                  alt="Xverse Wallet logo"
                  className="h-6 w-6"
                />
              </div>
              <span className="text-xs mt-1">Xverse</span>
            </li>

            <li
              className="flex flex-col items-center"
              aria-label="Leather Wallet"
            >
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center soft-shadow">
                <img
                  src="/placeholder.svg?height=24&width=24"
                  alt="Leather Wallet logo"
                  className="h-6 w-6"
                />
              </div>
              <span className="text-xs mt-1">Leather</span>
            </li>
          </ul>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-xs text-center text-muted-foreground">
            By connecting your wallet, you agree to our{" "}
            <a
              href="/terms"
              className="underline focus:outline-none focus:ring-2"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="underline focus:outline-none focus:ring-2"
            >
              Privacy Policy
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
