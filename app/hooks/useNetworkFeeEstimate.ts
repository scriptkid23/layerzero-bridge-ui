import { useState, useEffect } from "react";
import { estimateGas, getGasPrice } from "wagmi/actions";
import { config } from "../components/Provider";
import { chainConfig } from "../config/chainConfig";

export type GasPriceType = "low" | "medium" | "fast";

export function useNetworkFeeEstimate({
  from,
  to,
  amount,
  sourceChain,
  destinationChain,
  gasPriceType = "medium",
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
        const _dstEid = chainConfig[destinationChain]?._dstEid;
        if (!bridgeAddress || !_dstEid)
          throw new Error("Missing bridge config");
        // Estimate gas
        const gas = await estimateGas(config, {
          account: from,
          to: bridgeAddress,
        });
        // Get gas price
        let gasPrice = await getGasPrice(config);
        // Tùy chọn gas price (giả lập, có thể lấy từ API hoặc node nếu muốn chính xác hơn)
        if (gasPriceType === "low")
          gasPrice = (gasPrice * BigInt(9)) / BigInt(10);
        if (gasPriceType === "fast")
          gasPrice = (gasPrice * BigInt(12)) / BigInt(10);
        const fee = gas * gasPrice;
        if (!cancelled) setNetworkFee(fee);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to estimate network fee"
          );
          setNetworkFee(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [from, to, amount, sourceChain, destinationChain, gasPriceType]);

  return { networkFee, loading, error };
}
