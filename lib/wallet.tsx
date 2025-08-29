"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;
type EthereumRequestArgs = { method: string; params?: Json };
type EthereumProvider = {
  request: (args: EthereumRequestArgs) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

interface WalletContextValue {
  address: string | null;
  chainId: string | null; // hex string like 0x...
  isMetaMaskAvailable: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  addLazaiNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const eth = (typeof window !== "undefined" ? (window as unknown as { ethereum?: EthereumProvider }).ethereum : undefined);
  const isMetaMaskAvailable = !!eth;

  useEffect(() => {
    if (!eth) return;
    eth.request({ method: "eth_chainId" })
      .then((cid) => setChainId(typeof cid === "string" ? cid : null))
      .catch(() => {});
    eth.request({ method: "eth_accounts" })
      .then((accs) => setAddress(Array.isArray(accs) && typeof accs[0] === "string" ? accs[0] : null))
      .catch(() => {});

    const handleAccountsChanged = (...args: unknown[]) => {
      const accs = args[0];
      setAddress(Array.isArray(accs) && typeof accs[0] === "string" ? accs[0] : null);
    };
    const handleChainChanged = (...args: unknown[]) => {
      const cid = args[0];
      setChainId(typeof cid === "string" ? cid : null);
    };
    eth.on?.("accountsChanged", handleAccountsChanged);
    eth.on?.("chainChanged", handleChainChanged);
    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [eth]);

  const connect = useCallback(async () => {
    if (!eth) throw new Error("MetaMask not found");
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    setAddress(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : null);
    const cid = await eth.request({ method: "eth_chainId" });
    setChainId(typeof cid === "string" ? cid : null);
  }, [eth]);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const addLazaiNetwork = useCallback(async () => {
    if (!eth) throw new Error("MetaMask not found");
    const decChainId = 133718;
    const hexChainId = "0x" + decChainId.toString(16);
    const params = {
      chainId: hexChainId,
      chainName: "LazAI Testnet",
      nativeCurrency: { name: "LAZAI", symbol: "LAZAI", decimals: 18 },
      rpcUrls: ["https://testnet.lazai.network"],
      blockExplorerUrls: ["https://testnet-explorer.lazai.network"],
    };
    await eth.request({ method: "wallet_addEthereumChain", params: [params] });
  }, [eth]);

  const value = useMemo<WalletContextValue>(() => ({ address, chainId, isMetaMaskAvailable, connect, disconnect, addLazaiNetwork }), [address, chainId, isMetaMaskAvailable, connect, disconnect, addLazaiNetwork]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export function formatAddress(addr: string | null): string {
  if (!addr) return "";
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}


