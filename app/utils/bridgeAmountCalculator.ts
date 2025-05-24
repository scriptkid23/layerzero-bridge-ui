export type BridgeAmountCalculator = (fromAmount: string, fromToken: string, toToken: string, sourceChain: string, destChain: string) => string;

// Default: 1-1 nếu cùng token, có thể mở rộng cho các cặp khác
export const defaultBridgeAmountCalculator: BridgeAmountCalculator = (
  fromAmount,
  fromToken,
  toToken,
  sourceChain,
  destChain
) => {
  if (fromToken === toToken) return fromAmount;
  // Có thể mở rộng cho các cặp khác, ví dụ:
  // if (fromToken === 'USDT' && toToken === 'BUSD') return (parseFloat(fromAmount) * 0.99).toString();
  // ...
  return fromAmount; // fallback
}; 