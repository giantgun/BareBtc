"use client";

import { useState } from "react";
import { Landmark, Wallet } from "lucide-react";
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

export function ConnectWallet() {
  const { connectToWallet, connecting } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectToWallet();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md web3-card web3-card-highlight">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/20">
            <Landmark className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl bitcoin-gradient">
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

          {/* Stacks Connect Button */}
          <Button
            className="w-full h-14 web3-button pulse-on-hover"
            onClick={handleConnect}
            disabled={connecting || isConnecting}
          >
            {connecting || isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>

          <div className="flex items-center gap-2 justify-center">
            <div className="h-px flex-1 bg-border/50"></div>
            <span className="text-xs text-muted-foreground">
              Supported wallets
            </span>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>

          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center soft-shadow">
                <img
                  src="/placeholder.svg?height=24&width=24"
                  alt="Hiro Wallet"
                  className="h-6 w-6"
                />
              </div>
              <span className="text-xs mt-1">Hiro</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center soft-shadow">
                <img
                  src="/placeholder.svg?height=24&width=24"
                  alt="Xverse Wallet"
                  className="h-6 w-6"
                />
              </div>
              <span className="text-xs mt-1">Xverse</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center soft-shadow">
                <img
                  src="/placeholder.svg?height=24&width=24"
                  alt="Leather Wallet"
                  className="h-6 w-6"
                />
              </div>
              <span className="text-xs mt-1">Leather</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-xs text-center text-muted-foreground">
            By connecting your wallet, you agree to our Terms of Service and
            Privacy Policy
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
