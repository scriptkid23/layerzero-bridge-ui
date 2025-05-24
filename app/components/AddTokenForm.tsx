import React from "react";
import { Plus } from "lucide-react";

interface AddTokenFormProps {
  dstEid: string;
  localToken: string;
  dstToken: string;
  liquidityToken: string;
  liquidityAmount: string;
  setDstEid: (v: string) => void;
  setLocalToken: (v: string) => void;
  setDstToken: (v: string) => void;
  setLiquidityToken: (v: string) => void;
  setLiquidityAmount: (v: string) => void;
  isWalletConnected: boolean;
  renderWalletButton: () => React.ReactNode;
}

export default function AddTokenForm(props: AddTokenFormProps) {
  const {
    dstEid,
    localToken,
    dstToken,
    liquidityToken,
    liquidityAmount,
    setDstEid,
    setLocalToken,
    setDstToken,
    setLiquidityToken,
    setLiquidityAmount,
    isWalletConnected,
    renderWalletButton,
  } = props;

  return (
    <div className="space-y-6">
      {/* Add Supported Token Section */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/30">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Add Supported Token</h3>
          {/* dstEid Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">dstEid (uint32)</label>
            <input
              type="text"
              value={dstEid}
              onChange={(e) => setDstEid(e.target.value)}
              placeholder="dstEid (uint32)"
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          {/* localToken Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">localToken (address)</label>
            <input
              type="text"
              value={localToken}
              onChange={(e) => setLocalToken(e.target.value)}
              placeholder="localToken (address)"
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          {/* dstToken Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">dstToken (address)</label>
            <input
              type="text"
              value={dstToken}
              onChange={(e) => setDstToken(e.target.value)}
              placeholder="dstToken (address)"
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          {/* Write Button */}
          {isWalletConnected ? (
            <button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium text-base rounded-xl transition-all duration-200 border-0 cursor-pointer">
              Write
            </button>
          ) : (
            <button
              disabled
              className="w-full h-12 bg-gray-300 text-gray-500 font-medium text-base rounded-xl cursor-not-allowed"
            >
              Connect Wallet to Write
            </button>
          )}
        </div>
      </div>
      {/* Add Liquidity Section */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/30">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Add Liquidity</h3>
          {/* token Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">token (address)</label>
            <input
              type="text"
              value={liquidityToken}
              onChange={(e) => setLiquidityToken(e.target.value)}
              placeholder="token (address)"
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          {/* amount Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              amount (uint256)
              <Plus className="w-4 h-4 text-gray-400" />
            </label>
            <input
              type="text"
              value={liquidityAmount}
              onChange={(e) => setLiquidityAmount(e.target.value)}
              placeholder="amount (uint256)"
              className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          {/* Write Button */}
          {isWalletConnected ? (
            <button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium text-base rounded-xl transition-all duration-200 border-0 cursor-pointer">
              Write
            </button>
          ) : (
            <button
              disabled
              className="w-full h-12 bg-gray-300 text-gray-500 font-medium text-base rounded-xl cursor-not-allowed"
            >
              Connect Wallet to Write
            </button>
          )}
        </div>
      </div>
      {/* Connect Wallet Button */}
      {renderWalletButton()}
    </div>
  );
} 