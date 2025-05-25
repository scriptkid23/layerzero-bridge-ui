import React from "react";
import { Wallet } from "lucide-react";

interface WalletButtonProps {
  isWalletConnected: boolean;
  walletAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletButton = ({ isWalletConnected, walletAddress, onConnect, onDisconnect }: WalletButtonProps) => {
  if (isWalletConnected) {
    return (
      <button
        onClick={onDisconnect}
        className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium text-base rounded-xl transition-all duration-200 border-0 cursor-pointer flex items-center justify-center gap-2"
      >
        <Wallet className="w-5 h-5" />
        <span className="truncate">{walletAddress}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onConnect}
      className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium text-base rounded-xl transition-all duration-200 border-0 cursor-pointer flex items-center justify-center gap-2"
    >
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </button>
  );
};

export default React.memo(WalletButton);