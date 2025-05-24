import { create } from 'zustand';

interface BridgeState {
  sourceChain: string;
  destChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  setSourceChain: (chain: string) => void;
  setDestChain: (chain: string) => void;
  setFromToken: (token: string) => void;
  setToToken: (token: string) => void;
  setFromAmount: (amount: string) => void;
  setToAmount: (amount: string) => void;
}

export const useBridgeStore = create<BridgeState>((set) => ({
  sourceChain: 'bscTestnet',
  destChain: 'sepolia',
  fromToken: 'USDT',
  toToken: 'USDT',
  fromAmount: '',
  toAmount: '',
  setSourceChain: (chain) => set({ sourceChain: chain }),
  setDestChain: (chain) => set({ destChain: chain }),
  setFromToken: (token) => set({ fromToken: token }),
  setToToken: (token) => set({ toToken: token }),
  setFromAmount: (amount) => set({ fromAmount: amount }),
  setToAmount: (amount) => set({ toAmount: amount }),
})); 