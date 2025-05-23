"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import {
  connect,
  disconnect,
  isConnected,
  getLocalStorage,
  request,
} from "@stacks/connect";
import {
  Cl,
  fetchCallReadOnlyFunction,
  ResponseOkCV,
  TupleCV,
  UIntCV,
  cvToJSON,
  cvToValue,
  PostCondition,
} from "@stacks/transactions";

type WalletContextType = {
  connected: boolean | null;
  connecting: boolean;
  address: string | null;
  balance: number | null;
  creditScore: number | null;
  timePerBlock: number;
  currentBlockHeight: number;
  isLoading: boolean;
  connectToWallet: () => Promise<void>;
  disconnectFromWallet: () => void;
  reload: () => void;
  borrow: (amount: number) => Promise<string>;
  repay: (totalDue: number, address: string) => Promise<string>;
  activeLoan: {
    amount: number | null;
    issuedBlock: number | null;
    dueBlock: number | null;
    interestRate: number | null;
    totalDue: number | null;
  };
  accountData: {
    totalLoans: number | null;
    onTimeLoans: number | null;
    lateLoans: number | null;
  };
  loanElgibility: {
    loanLimit: number | null;
    interestRate: number | null;
    duration: number | null;
  };
  lenderInfo: {
    lenderBalance: number | null;
    lenderPoolBalance: number | null;
    lockedBlock: number | null;
    unlockBlock: number | null;
    timeInPool: number | null;
  };
  poolInfo: {
    lockDuration: number | null;
    poolSize: number | null;
    contractBalance: number | null;
  };
  poolContractName: string;
  poolContractAdrress: string;
  sbtcTokenContractAddress: string;
};

const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  address: null,
  balance: null,
  timePerBlock: 600,
  currentBlockHeight: 0,
  isLoading: true,
  connectToWallet: async () => {},
  disconnectFromWallet: () => {},
  reload: () => {},
  borrow: async (amount: number) => "",
  repay: async (totalDue: number, address: string) => "",
  creditScore: 0,
  activeLoan: {
    amount: 0,
    issuedBlock: 0,
    dueBlock: 0,
    interestRate: 0,
    totalDue: 0,
  },
  accountData: {
    totalLoans: 0,
    onTimeLoans: 0,
    lateLoans: 0,
  },
  loanElgibility: {
    loanLimit: 0,
    interestRate: 0,
    duration: 0,
  },
  lenderInfo: {
    lenderBalance: 0,
    lenderPoolBalance: 0,
    lockedBlock: 0,
    unlockBlock: 0,
    timeInPool: 0,
  },
  poolInfo: {
    lockDuration: 0,
    poolSize: 0,
    contractBalance: 0,
  },
  poolContractName: "",
  poolContractAdrress: "",
  sbtcTokenContractAddress: "",
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const connected = typeof window !== "undefined" ? isConnected() : null;
  const [connecting, setConnecting] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lenderInfo, setLenderInfo] = useState<WalletContextType["lenderInfo"]>(
    {
      lenderBalance: null,
      lenderPoolBalance: null,
      lockedBlock: null,
      unlockBlock: null,
      timeInPool: null,
    },
  );
  const [poolInfo, setPoolInfo] = useState<WalletContextType["poolInfo"]>({
    lockDuration: null,
    poolSize: null,
    contractBalance: null,
  });
  const [loanElgibility, setLoanElgibility] = useState<
    WalletContextType["loanElgibility"]
  >({
    loanLimit: null,
    interestRate: null,
    duration: null,
  });
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number>(0);
  const timePerBlock = 600;
  const [activeLoan, setActiveLoan] = useState<WalletContextType["activeLoan"]>(
    {
      amount: null,
      issuedBlock: null,
      dueBlock: null,
      interestRate: null,
      totalDue: null,
    },
  );
  const [accountData, setAccountData] = useState<
    WalletContextType["accountData"]
  >({
    totalLoans: null,
    onTimeLoans: null,
    lateLoans: null,
  });
  const { toast } = useToast();
  const sbtcTokenContractAddress = "ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT";
  const poolContractAdrress = "STEF284Y9NT9A2DGCTR5KGFHYJ25K08X363DY0ZW";
  const poolContractName = "sbtc-pool";

  const reload = async () => {
    setReloadData(reloadData!);
  };

  // SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token mainnet contract
  const getSbtcBalance = async (address: string) => {
    const options = {
      contractAddress: sbtcTokenContractAddress,
      contractName: "sbtc-token",
      functionName: "get-balance",
      functionArgs: [Cl.standardPrincipal(address)],
      network: "testnet" as "testnet",
      senderAddress: address,
    };
    const balance = (await fetchCallReadOnlyFunction(
      options,
    )) as ResponseOkCV<UIntCV>;
    setBalance(Number(balance.value.value) / 100000000);
    return Number(balance.value.value) / 100000000;
  };

  const getCurrentBlockHeight = async (address: string) => {
    const options = {
      contractAddress: poolContractAdrress,
      contractName: poolContractName,
      functionName: "get-block-height",
      functionArgs: [Cl.standardPrincipal(address)],
      network: "testnet" as "testnet",
      senderAddress: address,
    };
    const info = (await fetchCallReadOnlyFunction(
      options,
    )) as ResponseOkCV<UIntCV>;

    const blockHeight = info.value.value as any;
    const currentBlockHeight = Number(blockHeight.stacks_block_height.value);
    setCurrentBlockHeight(currentBlockHeight);
    return info;
  };

  const getLoanLimitInfo = async (address: string) => {
    const options = {
      contractAddress: poolContractAdrress,
      contractName: poolContractName,
      functionName: "get-loan-limit-info",
      functionArgs: [Cl.standardPrincipal(address)],
      network: "testnet" as "testnet",
      senderAddress: address,
    };
    const info = cvToJSON(
      (await fetchCallReadOnlyFunction(options)) as ResponseOkCV<TupleCV>,
    );
    const credit_score = cvToValue(info.value.value.credit_score);
    setCreditScore(credit_score);

    return info.value;
  };

  const getBorrowerInfo = async (address: string) => {
    const options = {
      contractAddress: poolContractAdrress,
      contractName: poolContractName,
      functionName: "get-borrower-info",
      functionArgs: [Cl.standardPrincipal(address)],
      network: "testnet" as "testnet",
      senderAddress: address,
    };
    const info = (await fetchCallReadOnlyFunction(
      options,
    )) as ResponseOkCV<TupleCV>;

    const activeLoan = info.value.value.active_loan as any;
    const accountData = info.value.value.account_data as any;

    if (activeLoan.type !== "none") {
      const totalDue =
        Number(cvToValue(info.value.value.repayment_amount_due)) / 100000000;
      const amount =
        Number(activeLoan.value.value.amount.value || 0) / 100000000;
      const dueBlock = Number(activeLoan.value.value.due_block.value || 0);
      const issuedBlock = Number(
        activeLoan.value.value.issued_block.value || 0,
      );
      const interestRate = Number(
        activeLoan.value.value.interest_rate.value || 0,
      );

      const totalLoans = Number(
        cvToValue(accountData.value.value.total_loans || Cl.uint(0)),
      );
      const onTimeLoans = Number(
        cvToValue(accountData.value.value.on_time_loans || Cl.uint(0)),
      );
      const lateLoans = Number(
        cvToValue(accountData.value.value.late_loans || Cl.uint(0)),
      );

      setActiveLoan({
        amount,
        dueBlock,
        issuedBlock,
        interestRate,
        totalDue,
      });
      setAccountData({
        totalLoans,
        onTimeLoans,
        lateLoans,
      });
    }
    if (accountData.type !== "none") {
      const totalLoans = Number(
        accountData.value.value.total_loans.value || Cl.uint(0),
      );
      const onTimeLoans = Number(
        accountData.value.value.on_time_loans.value || Cl.uint(0),
      );
      const lateLoans = Number(
        accountData.value.value.late_loans.value || Cl.uint(0),
      );

      setAccountData({
        totalLoans,
        onTimeLoans,
        lateLoans,
      });

      return info;
    }
    const totalDue =
      Number(cvToValue(info.value.value.repayment_amount_due)) / 100000000;
    const amount = 0;
    const dueBlock = 0;
    const issuedBlock = 0;
    const interestRate = 0;

    const totalLoans = 0;
    const onTimeLoans = 0;
    const lateLoans = 0;

    setActiveLoan({
      amount,
      dueBlock,
      issuedBlock,
      interestRate,
      totalDue,
    });
    setAccountData({
      totalLoans,
      onTimeLoans,
      lateLoans,
    });
    return info;
  };

  const getLoanEligibility = async (address: string) => {
    const options = {
      contractAddress: poolContractAdrress,
      contractName: poolContractName,
      functionName: "get-loan-eligibility-info",
      functionArgs: [Cl.standardPrincipal(address)],
      network: "testnet" as "testnet",
      senderAddress: address,
    };
    const info = (await fetchCallReadOnlyFunction(options)) as any;
    const loanLimit = Number(info.value.value.loan_limit.value) / 100000000;
    const interestRate = Number(info.value.value.interest_rate.value);
    const duration = Number(info.value.value.duration.value);
    setLoanElgibility({
      loanLimit,
      interestRate,
      duration,
    });
  };

  const getLendInfo = async (address: string) => {
    const options1 = {
      contractAddress: poolContractAdrress,
      contractName: poolContractName,
      functionName: "get-lender-info",
      functionArgs: [],
      network: "testnet" as "testnet",
      senderAddress: address,
    };
    const info1 = (await fetchCallReadOnlyFunction(options1)) as any;
    const lenderBalance =
      Number(info1.value.value.lender_balance.value) / 100000000;
    const lenderPoolBalance =
      Number(info1.value.value.lender_pool_balance.value) / 100000000;
    const lockedBlock = Number(info1.value.value.locked_block.value);
    const unlockBlock = Number(info1.value.value.unlock_block.value);
    const timeInPool =
      Number(info1.value.value.time_in_pool_in_seconds.value) / (60 * 60 * 24);
    setLenderInfo({
      lenderBalance,
      lenderPoolBalance,
      lockedBlock,
      unlockBlock,
      timeInPool,
    });

    const options2 = {
      contractAddress: poolContractAdrress,
      contractName: poolContractName,
      functionName: "get-lending-pool-info",
      functionArgs: [],
      network: "testnet" as "testnet",
      senderAddress: address,
    };
    const info2 = (await fetchCallReadOnlyFunction(options2)) as any;
    const poolSize = Number(info2.value.value.pool_size.value) / 100000000;
    const contractBalance =
      Number(info2.value.value.contract_balance.value) / 100000000;
    const lockDuration = Number(info2.value.value.lock_duration_in_days.value);
    setPoolInfo({
      lockDuration,
      poolSize,
      contractBalance,
    });
  };

  const initializeInfo = async (userAddress: string) => {
    try {
      await getSbtcBalance(userAddress);
      await getLoanEligibility(userAddress);
      await getLendInfo(userAddress);
      await getLoanLimitInfo(userAddress);
      await getCurrentBlockHeight(userAddress);
      await getBorrowerInfo(userAddress);
    } catch (error: any) {
      toast({
        title: "Error while loading data",
        description: `${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Check if wallet was previously connected
  useEffect(() => {
    if (isConnected()) {
      if (typeof window !== "undefined") {
        const data = getLocalStorage();
        const userAddress = data?.addresses.stx[0].address!;
        setAddress(userAddress);
        initializeInfo(userAddress);
      }
    }
  }, [reloadData]);

  const connectToWallet = async () => {
    try {
      setConnecting(true);
      // Simulate wallet connection
      await connect();
      if (typeof window !== "undefined") {
        const data = getLocalStorage();

        if (data == undefined) {
          throw new Error();
        }
        const userAddress = data?.addresses.stx[0].address;
        setAddress(userAddress);
        getSbtcBalance(userAddress);
        getLoanLimitInfo(userAddress);
        getBorrowerInfo(userAddress);

        toast({
          title: "Wallet Connected",
          description: `Connected to ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectFromWallet = async () => {
    disconnect();
    setAddress(null);
    setBalance(0);
    localStorage.removeItem("walletAddress");
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const borrow = async (amount: number) => {
    const condition = {
      type: "ft-postcondition",
      address: `${poolContractAdrress}.${poolContractName}`, // Stacks c32-encoded, with optional contract name suffix
      condition: "eq",
      asset: `${sbtcTokenContractAddress}.sbtc-token::sbtc-token`, // Stacks c32-encoded address, with contract name suffix, with asset suffix
      amount: `${Math.round(amount)}`, // `bigint` compatible, amount in lowest integer denomination of fungible token
    } as PostCondition;

    (await request("stx_callContract", {
      contract: `${poolContractAdrress}.${poolContractName}`,
      functionName: "apply-for-loan",
      functionArgs: [Cl.uint(Math.round(amount))],
      network: "testnet",
      postConditions: [condition],
      postConditionMode: "deny",
    })) as any;

    return "";
  };

  const repay = async (totalDue: number, address: string) => {
    const condition = {
      type: "ft-postcondition",
      address: address, // Stacks c32-encoded, with optional contract name suffix
      condition: "eq",
      asset: `${sbtcTokenContractAddress}.sbtc-token::sbtc-token`, // Stacks c32-encoded address, with contract name suffix, with asset suffix
      amount: `${totalDue}`, // `bigint` compatible, amount in lowest integer denomination of fungible token
    } as PostCondition;

    await request("stx_callContract", {
      contract: `${poolContractAdrress}.${poolContractName}`,
      functionName: "repay-loan",
      functionArgs: [Cl.standardPrincipal(address!)],
      network: "testnet",
      postConditions: [condition],
      postConditionMode: "deny",
    });

    reload();
    return "";
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        address,
        balance,
        currentBlockHeight,
        isLoading,
        connectToWallet,
        disconnectFromWallet,
        reload,
        borrow,
        repay,
        creditScore,
        activeLoan,
        accountData,
        timePerBlock,
        loanElgibility,
        poolContractName,
        poolContractAdrress,
        sbtcTokenContractAddress,
        lenderInfo,
        poolInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
