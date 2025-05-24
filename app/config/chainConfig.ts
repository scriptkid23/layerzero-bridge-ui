// Chain contract config for supported networks
export type ChainConfig = Record<
  string,
  { usdt: string | null; bridge: string | null; _dstEid: number | null }
>;

export const chainConfig: ChainConfig = {
  mainnet: { usdt: null, bridge: null, _dstEid: null },
  polygon: { usdt: null, bridge: null, _dstEid: null },
  bscTestnet: {
    usdt: "0x340Ab63e032C9354fD8d18f97833A1aB75AC1Ff7",
    bridge: "0xe71a0009716752E1d32eaE3089F4152bc5F1ebA6",
    _dstEid: 40102,
  },
  sepolia: {
    usdt: "0x2B6069650B78b10fab9D54c9A6B6AD84b045a1CA",
    bridge: "0x212Fbda4a5B034700E1C6422880b13C9f41180FB",
    _dstEid: 40161,
  },
}; 