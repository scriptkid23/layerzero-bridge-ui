import React from 'react';
import { useErc20Contract } from '../hooks/useErc20Contract';

interface MintErc20ButtonProps {
  usdtAddress: `0x${string}` | null;
  isWalletConnected: boolean;
  address?: `0x${string}`;
}

export const MintErc20Button: React.FC<MintErc20ButtonProps> = ({ usdtAddress, isWalletConnected, address }) => {
  const erc20 = usdtAddress ? useErc20Contract(usdtAddress) : null;
  const [mintStatus, setMintStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mintError, setMintError] = React.useState<string | null>(null);

  const handleMint = async () => {
    if (!erc20 || !address) return;
    setMintStatus('loading');
    setMintError(null);
    try {
      // Mint 1000 USDT (6 decimals)
      const amount = BigInt(1000) * (BigInt(10) ** BigInt(6));
      await erc20.mint(address, amount);
      setMintStatus('success');
    } catch (e: any) {
      setMintStatus('error');
      setMintError(e?.message || 'Mint failed');
    }
  };

  if (!isWalletConnected || !usdtAddress) return null;

  return (
    <div className="my-4">
      <button
        className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200 border-0 cursor-pointer"
        onClick={handleMint}
        disabled={mintStatus === 'loading'}
      >
        {mintStatus === 'loading' ? 'Minting...' : 'Mint 1000 USDT (Test)'}
      </button>
      {mintStatus === 'success' && <div className="text-green-600 text-sm mt-2">Mint successful!</div>}
      {mintStatus === 'error' && <div className="text-red-600 text-sm mt-2">{mintError}</div>}
    </div>
  );
}; 