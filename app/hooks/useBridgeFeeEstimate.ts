import { useState, useEffect } from "react";
import { useBridgeContract } from "./useBridgeContract";

export function useBridgeFeeEstimate({
  amount,
  to,
  sourceChain,
  destinationChain,
}: {
  amount: bigint | null;
  to: string;
  sourceChain: string;
  destinationChain: string;
}) {
  const { calculateNativeFees } = useBridgeContract();
  const [nativeFee, setNativeFee] = useState<bigint | null>(null);
  const [lzTokenFee, setLzTokenFee] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!amount || !to || !sourceChain || !destinationChain) {
      setNativeFee(null);
      setLzTokenFee(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    calculateNativeFees(
      amount,
      to as `0x${string}`,
      destinationChain,
      sourceChain
    )
      .then(
        (
          result: { nativeFee: bigint; lzTokenFee: bigint | null } | undefined
        ) => {
          if (cancelled) return;

          if (result && result.nativeFee !== undefined) {
            setNativeFee(result.nativeFee);

            setLzTokenFee(result.lzTokenFee ?? null);
          } else {
            setNativeFee(null);
            setLzTokenFee(null);
          }
        }
      )
      //@ts-nocheck
      .catch((err: unknown) => {
        console.error(err);
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to estimate bridge fee"
        );
        setNativeFee(null);
        setLzTokenFee(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, to, sourceChain, destinationChain]);

  return { nativeFee, lzTokenFee, loading, error };
}
