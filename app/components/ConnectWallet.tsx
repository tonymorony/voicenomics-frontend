"use client";

import { formatAddress, useWallet } from "@/lib/wallet";

export default function ConnectWallet() {
  const { address, isMetaMaskAvailable, connect, disconnect, addLazaiNetwork, chainId } = useWallet();

  if (!isMetaMaskAvailable) {
    return <a className="app-btn-outline text-sm" href="https://metamask.io/" target="_blank" rel="noreferrer">Install MetaMask</a>;
  }

  return (
    <div className="flex items-center gap-2">
      {address ? (
        <>
          <button className="app-btn-outline text-sm" onClick={disconnect}>{formatAddress(address)}</button>
          {chainId !== "0x20a66" && (
            <button className="app-btn-outline text-xs" onClick={addLazaiNetwork}>Add LazAI</button>
          )}
        </>
      ) : (
        <button className="app-btn-primary text-sm" onClick={connect}>Connect wallet</button>
      )}
    </div>
  );
}


