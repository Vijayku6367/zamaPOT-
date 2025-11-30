"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("connectedAddress");
    if (cached) setAddress(cached);

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on?.("accountsChanged", (accounts: string[]) => {
        if (accounts && accounts.length) {
          setAddress(accounts[0]);
          localStorage.setItem("connectedAddress", accounts[0]);
        } else {
          setAddress(null);
          localStorage.removeItem("connectedAddress");
        }
      });
      window.ethereum.on?.("chainChanged", () => {
      });
    }
  }, []);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        const want = confirm("MetaMask not detected. Open MetaMask site to install?");
        if (want) window.open("https://metamask.io/download/", "_blank");
        return;
      }

      setConnecting(true);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        setAddress(accounts[0]);
        localStorage.setItem("connectedAddress", accounts[0]);
      }
    } catch (e: any) {
      console.error("connect error", e);
      alert(e?.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem("connectedAddress");
  };

  return (
    <div>
      {address ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            fontFamily: "monospace"
          }}>
            {address.slice(0,6)}...{address.slice(-4)}
          </div>
          <button onClick={disconnect} style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "white",
            cursor: "pointer"
          }}>
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={connect} disabled={connecting} style={{
          padding: "10px 16px",
          borderRadius: 12,
          background: connecting ? "#2b2b2b" : "linear-gradient(90deg,#4C63FF,#7DA5FF)",
          color: "white",
          border: "none",
          cursor: connecting ? "not-allowed" : "pointer"
        }}>
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
