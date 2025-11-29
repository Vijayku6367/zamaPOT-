"use client";

import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";

type WalletConnectProps = {
  onConnect?: (address: string) => void;
};

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  return (
    <button
      onClick={() => open()}
      className="px-4 py-2 bg-[#111] border border-gray-700 rounded-xl text-white"
    >
      {address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "Connect Wallet"}
    </button>
  );
}
