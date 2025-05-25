"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import Sidebar from "./components/Sidebar";
import WalletButton from "./components/WalletButton";
import TransferForm from "./components/TransferForm";
import AddTokenForm from "./components/AddTokenForm";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useBridgeStore } from "./store/bridgeStore";
import { defaultBridgeAmountCalculator } from "./utils/bridgeAmountCalculator";
import { chainConfig } from "./config/chainConfig";

interface Network {
  id: string;
  name: string;
  icon: string;
  color: string;
  tokens: string[];
}

const networks: Network[] = [
  {
    id: "mainnet",
    name: "Ethereum Mainnet",
    icon: "ethereum",
    color: "bg-blue-600",
    tokens: ["ETH", "USDC", "USDT", "DAI", "WBTC"],
  },
  {
    id: "polygon",
    name: "Polygon Chain",
    icon: "polygon",
    color: "bg-purple-600",
    tokens: ["MATIC", "USDC", "USDT", "BUSD", "WETH"],
  },
  {
    id: "bscTestnet",
    name: "BSC Testnet",
    icon: "bsc",
    color: "bg-yellow-500",
    tokens: ["BNB", "BUSD", "USDT", "CAKE", "BSC"],
  },
  {
    id: "sepolia",
    name: "Sepolia Testnet",
    icon: "ethereum",
    color: "bg-gray-400",
    tokens: ["ETH", "USDC", "USDT", "DAI"],
  },
];

const tokenIcons: { [key: string]: string } = {
  MATIC: "🔷",
  USDC: "💵",
  USDT: "💰",
  BUSD: "💳",
  WETH: "💎",
  ETH: "💎",
  DAI: "🟡",
  WBTC: "🟠",
  BNB: "🟨",
  CAKE: "🍰",
  BSC: "🟨",
  ARB: "��",
  GMX: "⚡",
};

// WalletButtonComponent tách riêng để tránh tạo function inline
const WalletButtonComponent = React.memo(function WalletButtonComponent({ isWalletConnected, walletAddress, onConnect, onDisconnect }: { isWalletConnected: boolean, walletAddress: string, onConnect: () => void, onDisconnect: () => void }) {
  return (
    <WalletButton
      isWalletConnected={isWalletConnected}
      walletAddress={walletAddress}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
    />
  );
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("transfer");
  // zustand store
  const {
    sourceChain,
    destChain,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    setSourceChain,
    setDestChain,
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
  } = useBridgeStore();

  // Network and token states (for dropdowns only)
  const [fromNetwork, setFromNetwork] = useState(networks[0]);
  const [toNetwork, setToNetwork] = useState(networks[1]);

  React.useEffect(() => {
    const from = networks.find((n) => n.id === sourceChain);
    const to = networks.find((n) => n.id === destChain);
    if (from) setFromNetwork(from);
    if (to) setToNetwork(to);
  }, [sourceChain, destChain]);

  // Dropdown states
  const [showFromNetworkDropdown, setShowFromNetworkDropdown] = useState(false);
  const [showToNetworkDropdown, setShowToNetworkDropdown] = useState(false);
  const [showFromTokenDropdown, setShowFromTokenDropdown] = useState(false);
  const [showToTokenDropdown, setShowToTokenDropdown] = useState(false);

  // Add token form states
  const [dstEid, setDstEid] = useState("");
  const [localToken, setLocalToken] = useState("");
  const [dstToken, setDstToken] = useState("");
  const [liquidityToken, setLiquidityToken] = useState("");
  const [liquidityAmount, setLiquidityAmount] = useState("");

  // Refs for click outside and animations
  const fromNetworkRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const toNetworkRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const fromTokenRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const toTokenRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const contentRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const tabIndicatorRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const { disconnect } = useDisconnect();

  // GSAP tab animation
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;

    // Animate content out
    gsap.to(contentRef.current, {
      opacity: 0,
      x: -20,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => {
        setActiveTab(tab);
        // Animate content in
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
        );
      },
    });

    // Animate tab indicator
    const tabElement = document.querySelector(`[data-tab="${tab}"]`);
    if (tabElement && tabIndicatorRef.current) {
      const rect = tabElement.getBoundingClientRect();
      const containerRect = tabElement.parentElement?.getBoundingClientRect();
      if (containerRect) {
        gsap.to(tabIndicatorRef.current, {
          y: rect.top - containerRect.top,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fromNetworkRef.current &&
        !fromNetworkRef.current.contains(event.target as Node)
      ) {
        setShowFromNetworkDropdown(false);
      }
      if (
        toNetworkRef.current &&
        !toNetworkRef.current.contains(event.target as Node)
      ) {
        setShowToNetworkDropdown(false);
      }
      if (
        fromTokenRef.current &&
        !fromTokenRef.current.contains(event.target as Node)
      ) {
        setShowFromTokenDropdown(false);
      }
      if (
        toTokenRef.current &&
        !toTokenRef.current.contains(event.target as Node)
      ) {
        setShowToTokenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fromNetworkRef, toNetworkRef, fromTokenRef, toTokenRef]);

  // Initialize tab indicator position
  useEffect(() => {
    const activeTabElement = document.querySelector(
      `[data-tab="${activeTab}"]`
    );
    if (activeTabElement && tabIndicatorRef.current) {
      const rect = activeTabElement.getBoundingClientRect();
      const containerRect =
        activeTabElement.parentElement?.getBoundingClientRect();
      if (containerRect) {
        gsap.set(tabIndicatorRef.current, {
          y: rect.top - containerRect.top,
        });
      }
    }
  }, [activeTab, tabIndicatorRef]);

  // Memo hóa networks và tokenIcons
  const memoNetworks = useMemo(() => networks, []);
  const memoTokenIcons = useMemo(() => tokenIcons, []);

  // Handler bọc useCallback
  const handleSetFromNetwork = useCallback((network: Network) => {
    setFromNetwork(network);
    setSourceChain(network.id);
    setFromToken(network.tokens[0]);
  }, [setFromNetwork, setSourceChain, setFromToken]);

  const handleSetToNetwork = useCallback((network: Network) => {
    setToNetwork(network);
    setDestChain(network.id);
    setToToken(network.tokens[0]);
  }, [setToNetwork, setDestChain, setToToken]);

  const handleSetFromToken = useCallback((token: string) => {
    setFromToken(token);
  }, [setFromToken]);

  const handleSetToToken = useCallback((token: string) => {
    setToToken(token);
  }, [setToToken]);

  const handleSetFromAmount = useCallback((amount: string) => {
    setFromAmount(amount);
    const calculated = defaultBridgeAmountCalculator(
      amount,
      fromToken,
      toToken,
    );
    setToAmount(calculated);
  }, [setFromAmount, setToAmount, fromToken, toToken]);

  const handleSetToAmount = useCallback((amount: string) => {
    setToAmount(amount);
  }, [setToAmount]);

  const handleSwap = useCallback(() => {
    const tempNetwork = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(tempNetwork);
    setSourceChain(toNetwork.id);
    setDestChain(fromNetwork.id);
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  }, [fromNetwork, toNetwork, fromToken, toToken, fromAmount, toAmount, setFromNetwork, setToNetwork, setSourceChain, setDestChain, setFromToken, setToToken, setFromAmount, setToAmount]);

  // Wallet button render (dùng component memoized)
  const walletButtonNode = useMemo(() => (
    <WalletButtonComponent
      isWalletConnected={isConnected}
      walletAddress={address ?? ""}
      onConnect={() => connect({ connector: connectors[0] })}
      onDisconnect={() => disconnect()}
    />
  ), [isConnected, address, connect, connectors, disconnect]);

  return (
    <div className="max-w-6xl mx-auto p-4 flex gap-6">
      {/* Left Sidebar with Tabs */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabIndicatorRef={tabIndicatorRef}
      />
      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="p-6" ref={contentRef}>
            {activeTab === "transfer" ? (
              <TransferForm
                fromAmount={fromAmount}
                toAmount={toAmount}
                fromNetwork={fromNetwork}
                toNetwork={toNetwork}
                fromToken={fromToken}
                toToken={toToken}
                showFromNetworkDropdown={showFromNetworkDropdown}
                showToNetworkDropdown={showToNetworkDropdown}
                showFromTokenDropdown={showFromTokenDropdown}
                showToTokenDropdown={showToTokenDropdown}
                fromNetworkRef={fromNetworkRef}
                toNetworkRef={toNetworkRef}
                fromTokenRef={fromTokenRef}
                toTokenRef={toTokenRef}
                networks={memoNetworks}
                tokenIcons={memoTokenIcons}
                setFromAmount={handleSetFromAmount}
                setToAmount={handleSetToAmount}
                setFromNetwork={handleSetFromNetwork}
                setToNetwork={handleSetToNetwork}
                setFromToken={handleSetFromToken}
                setToToken={handleSetToToken}
                setShowFromNetworkDropdown={setShowFromNetworkDropdown}
                setShowToNetworkDropdown={setShowToNetworkDropdown}
                setShowFromTokenDropdown={setShowFromTokenDropdown}
                setShowToTokenDropdown={setShowToTokenDropdown}
                handleSwap={handleSwap}
                renderWalletButton={() => walletButtonNode}
                isWalletConnected={isConnected}
                chainConfig={chainConfig}
              />
            ) : (
              <AddTokenForm
                dstEid={dstEid}
                localToken={localToken}
                dstToken={dstToken}
                liquidityToken={liquidityToken}
                liquidityAmount={liquidityAmount}
                setDstEid={setDstEid}
                setLocalToken={setLocalToken}
                setDstToken={setDstToken}
                setLiquidityToken={setLiquidityToken}
                setLiquidityAmount={setLiquidityAmount}
                isWalletConnected={isConnected}
                renderWalletButton={() => walletButtonNode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
