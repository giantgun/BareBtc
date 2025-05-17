import { WalletProvider } from "@/hooks/use-wallet";
import { ConnectWallet } from "@/components/connect-wallet";

export default function Connect() {
  return (
    <WalletProvider>
      <ConnectWallet />
    </WalletProvider>
  );
}
