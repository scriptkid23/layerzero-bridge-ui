import { useState, useEffect } from 'react';
import { estimateGas, getGasPrice } from 'wagmi/actions';
import { config } from '../components/Provider';
import { bridgeAbi } from '../contracts/bridge';
import { chainConfig } from '../page';

export type GasPriceType = 'low' | 'medium' | 'fast';

export function useNetworkFeeEstimate({
  from,
  to,
  amount,
  sourceChain,
  destinationChain,
  gasPriceType = 'medium',
}: {
  from: `0x${string}`;
  to: `0x${string}`;
  amount: bigint | null;
  sourceChain: string;
  destinationChain: string;
  gasPriceType?: GasPriceType;
}) {
  const [networkFee, setNetworkFee] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to || !amount || !sourceChain || !destinationChain) {
      setNetworkFee(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const bridgeAddress = chainConfig[sourceChain]?.bridge as `0x${string}`;
        const tokenAddress = chainConfig[sourceChain]?.usdt as `0x${string}`;
        const _dstEid = chainConfig[destinationChain]?._dstEid;
        if (!bridgeAddress || !_dstEid) throw new Error('Missing bridge config');
        // Estimate gas
        const gas = await estimateGas(config, {
          abi: bridgeAbi,
          address: bridgeAddress,
          functionName: 'bridge',
          args: [_dstEid, tokenAddress, amount, to, '0x'],
          account: from,
        });
        // Get gas price
        let gasPrice = await getGasPrice(config);
        // Tùy chọn gas price (giả lập, có thể lấy từ API hoặc node nếu muốn chính xác hơn)
        if (gasPriceType === 'low') gasPrice = gasPrice * 9n / 10n;
        if (gasPriceType === 'fast') gasPrice = gasPrice * 12n / 10n;
        const fee = gas * gasPrice;
        if (!cancelled) setNetworkFee(fee);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to estimate network fee');
          setNetworkFee(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, amount, sourceChain, destinationChain, gasPriceType]);

  return { networkFee, loading, error };
} 