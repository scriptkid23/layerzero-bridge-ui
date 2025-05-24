import { useEffect, useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { usdtAbi } from '../contracts/erc20';
import { config } from '../components/Provider';

export function useErc20Balance(tokenAddress: `0x${string}` | null, userAddress: `0x${string}` | undefined) {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(() => {
    if (!tokenAddress || !userAddress) {
      setBalance(null);
      return;
    }
    setLoading(true);
    readContract(config, {
      abi: usdtAbi,
      address: tokenAddress,
      functionName: 'balanceOf',
      args: [userAddress],
    })
      .then((result) => setBalance(result as bigint))
      .catch(() => setBalance(null))
      .finally(() => setLoading(false));
  }, [tokenAddress, userAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, refreshBalance: fetchBalance };
} 