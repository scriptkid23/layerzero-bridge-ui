
// Default: 1-1 nếu cùng token, có thể mở rộng cho các cặp khác
export function defaultBridgeAmountCalculator(
  fromAmount: string,
  fromToken: string,
  toToken: string
) {
  if (fromToken === toToken) return fromAmount;
  // Có thể mở rộng cho các cặp khác, ví dụ:
  // if (fromToken === 'USDT' && toToken === 'BUSD') return (parseFloat(fromAmount) * 0.99).toString();
  // ...
  return fromAmount; // fallback
} 