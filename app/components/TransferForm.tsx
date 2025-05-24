import React from "react";
import { ChevronDown, ArrowUpDown, RotateCcw, Plus } from "lucide-react";
import { useSwitchChain, useAccount } from "wagmi";
import { useErc20Balance } from '../hooks/useErc20Balance';
import { useBridgeStore } from '../store/bridgeStore';
import { defaultBridgeAmountCalculator } from '../utils/bridgeAmountCalculator';
import { useBridgeContract } from '../hooks/useBridgeContract';
import { parseEther, parseUnits, formatEther } from 'viem';
import TransactionModal from './TransactionModal';
import { useTxModalStore } from '../store/txModalStore';
import { readContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { usdtAbi } from '../contracts/erc20';
import { config } from '../components/Provider';
import { useBridgeFeeEstimate } from '../hooks/useBridgeFeeEstimate';

interface Network {
  id: string;
  name: string;
  icon: string;
  color: string;
  tokens: string[];
}

interface TransferFormProps {
  fromAmount: string;
  toAmount: string;
  fromNetwork: Network;
  toNetwork: Network;
  fromToken: string;
  toToken: string;
  showFromNetworkDropdown: boolean;
  showToNetworkDropdown: boolean;
  showFromTokenDropdown: boolean;
  showToTokenDropdown: boolean;
  fromNetworkRef: React.RefObject<HTMLDivElement>;
  toNetworkRef: React.RefObject<HTMLDivElement>;
  fromTokenRef: React.RefObject<HTMLDivElement>;
  toTokenRef: React.RefObject<HTMLDivElement>;
  networks: Network[];
  tokenIcons: { [key: string]: string };
  setFromAmount: (v: string) => void;
  setToAmount: (v: string) => void;
  setFromNetwork: (n: Network) => void;
  setToNetwork: (n: Network) => void;
  setFromToken: (t: string) => void;
  setToToken: (t: string) => void;
  setShowFromNetworkDropdown: (v: boolean) => void;
  setShowToNetworkDropdown: (v: boolean) => void;
  setShowFromTokenDropdown: (v: boolean) => void;
  setShowToTokenDropdown: (v: boolean) => void;
  handleSwap: () => void;
  renderWalletButton: () => React.ReactNode;
  isWalletConnected: boolean;
  chainConfig: Record<string, { usdt: string | null; bridge: string | null }>;
}

export default function TransferForm(props: TransferFormProps) {
  const {
    fromAmount,
    toAmount,
    fromNetwork,
    toNetwork,
    fromToken,
    toToken,
    showFromNetworkDropdown,
    showToNetworkDropdown,
    showFromTokenDropdown,
    showToTokenDropdown,
    fromNetworkRef,
    toNetworkRef,
    fromTokenRef,
    toTokenRef,
    networks,
    tokenIcons,
    setFromAmount,
    setToAmount,
    setFromNetwork,
    setToNetwork,
    setFromToken,
    setToToken,
    setShowFromNetworkDropdown,
    setShowToNetworkDropdown,
    setShowFromTokenDropdown,
    setShowToTokenDropdown,
    handleSwap,
    renderWalletButton,
    isWalletConnected,
    chainConfig,
  } = props;

  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const {
    sourceChain,
    destChain,
    fromToken: bridgeFromToken,
    toToken: bridgeToToken,
    fromAmount: bridgeFromAmount,
    toAmount: bridgeToAmount,
    setFromAmount: setBridgeFromAmount,
    setToAmount: setBridgeToAmount,
  } = useBridgeStore();
  const { handleTransfer } = useBridgeContract();

  // chainIdMap for supported chains (move this above all dropdown handlers)
  const chainIdMap: Record<string, number> = {
    mainnet: 1,
    polygon: 137,
    bscTestnet: 97,
    sepolia: 11155111,
  };

  // Auto switch chain to match fromNetwork when wallet is connected
  React.useEffect(() => {
    if (!isConnected || !fromNetwork) return;
    const fromChainId = chainIdMap[fromNetwork.id];
    if (fromChainId && chainId !== fromChainId) {
      switchChain({ chainId: fromChainId });
    }
  }, [fromNetwork, isConnected, chainId, switchChain]);

  // Memoized handler for fromNetwork select (optional, for optimization)
  const handleFromNetworkSelect = React.useCallback((network: Network) => {
    setFromNetwork(network);
    setFromToken(network.tokens[0]);
    setShowFromNetworkDropdown(false);
  }, [setFromNetwork, setFromToken, setShowFromNetworkDropdown]);

  // Lấy address token hiện tại (fromToken) trên chain fromNetwork
  const tokenAddressMap = React.useMemo(() => {
    const map: Record<string, string | null> = {};
    // Chỉ map USDT, có thể mở rộng cho các token khác nếu cần
    if (chainConfig[fromNetwork.id]?.usdt) {
      map['USDT'] = chainConfig[fromNetwork.id]?.usdt;
    }
    // Có thể mở rộng cho các token khác ở đây
    return map;
  }, [fromNetwork, chainConfig]);
  const fromTokenAddress = tokenAddressMap[fromToken] as `0x${string}` | null;
  const { address } = useAccount();
  const { balance: fromTokenBalance, loading: loadingBalance, refreshBalance } = useErc20Balance(fromTokenAddress, address as `0x${string}` | undefined);

  // Thêm state cho recipient address
  const [recipientAddress, setRecipientAddress] = React.useState<string>("");

  // Tính toán phí cầu nối động
  const amountBigInt = fromAmount && !isNaN(Number(fromAmount)) ? parseUnits(fromAmount, 6) : null;
  const { nativeFee, loading: loadingBridgeFee, error: errorBridgeFee } = useBridgeFeeEstimate({
    amount: amountBigInt,
    to: recipientAddress.trim() || (address as string || ''),
    sourceChain,
    destinationChain: destChain,
  });

  const renderNetworkIcon = (network: Network) => {
    if (network.icon === "polygon") {
      return (
        <div
          className={`w-6 h-6 ${network.color} rounded-full flex items-center justify-center`}
        >
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          </div>
        </div>
      );
    } else if (network.icon === "ethereum") {
      return (
        <div
          className={`w-6 h-6 ${network.color} rounded-full flex items-center justify-center`}
        >
          <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
        </div>
      );
    } else if (network.icon === "bsc") {
      return (
        <div
          className={`w-6 h-6 ${network.color} rounded-full flex items-center justify-center`}
        >
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      );
    } else {
      return (
        <div
          className={`w-6 h-6 ${network.color} rounded-full flex items-center justify-center`}
        >
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      );
    }
  };

  const renderNetworkInfo = (
    network: Network,
    chainIdMap: Record<string, number>
  ) => (
    <div className="flex items-center gap-2">
      {renderNetworkIcon(network)}
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900 text-sm bg-gray-100 px-2 py-0.5 rounded-md w-fit">
          {network.name}
        </span>
        <span className="text-xs text-gray-500">
          Chain ID: {chainIdMap[network.id] ?? "-"}
        </span>
      </div>
    </div>
  );

  // Khi nhập fromAmount, tự động tính toAmount
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromAmount(e.target.value);
    const calculated = defaultBridgeAmountCalculator(
      e.target.value,
      fromToken,
      toToken,
      sourceChain,
      destChain
    );
    setToAmount(calculated);
  };

  // Khi nhập toAmount (nếu cho phép chỉnh tay)
  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToAmount(e.target.value);
  };

  // Hàm gọi bridge khi bấm Transfer
  const txModal = useTxModalStore();
  const onTransfer = async () => {
    if (!address) throw new Error('No wallet address');
    txModal.open();
    txModal.reset();
    try {
      // Step 1: Approve nếu cần
      txModal.setStepStatus(1, 'in-progress');
      const usdtAddressRaw = chainConfig[sourceChain]?.usdt;
      const bridgeAddressRaw = chainConfig[sourceChain]?.bridge;
      if (!usdtAddressRaw) throw new Error('USDT address not found for source chain');
      if (!bridgeAddressRaw) throw new Error('Bridge address not found for source chain');
      const usdtAddress = usdtAddressRaw as string as `0x${string}`;
      const bridgeAddress = bridgeAddressRaw as string as `0x${string}`;
      const amount = parseUnits(fromAmount, 6); // USDT 6 decimals
      // Kiểm tra allowance
      const userAddress = address as string as `0x${string}`;
      const allowance = await readContract(config, {
        abi: usdtAbi,
        address: usdtAddress,
        functionName: 'allowance',
        args: [userAddress, bridgeAddress],
      }) as bigint;
      if (allowance < amount) {
        const approveTx = await writeContract(config, {
          abi: usdtAbi,
          address: usdtAddress,
          functionName: 'approve',
          args: [bridgeAddress, amount],
          account: userAddress,
        });
        await waitForTransactionReceipt(config, { hash: approveTx });
      }
      txModal.setStepStatus(1, 'completed');
      // Step 2: Bridge
      txModal.setStepStatus(2, 'in-progress');
      const toAddress = recipientAddress.trim() || userAddress;
      const bridgeTx = await handleTransfer({
        _payableAmount: parseEther('0.001'),
        amount,
        to: toAddress as `0x${string}`,
        destinationChain: destChain,
        sourceChain: sourceChain,
      });

      if (!bridgeTx) throw new Error('Bridge transaction failed');
      await waitForTransactionReceipt(config, { hash: bridgeTx });
      txModal.setStepStatus(2, 'completed');
      txModal.setStepStatus(3, 'completed');
    } catch (err: any) {
      if (txModal.steps[0].status === 'in-progress') txModal.setStepStatus(1, 'error', err.message);
      else if (txModal.steps[1].status === 'in-progress') txModal.setStepStatus(2, 'error', err.message);
    }
  };

  return (
    <>
      <TransactionModal />
      <div className="space-y-6">
        {/* From Network Section */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/30">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">From Network</h3>
            {/* Network Selector */}
            <div className="relative" ref={fromNetworkRef}>
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-xl"
                onClick={() =>
                  setShowFromNetworkDropdown(!showFromNetworkDropdown)
                }
              >
                <div className="flex items-center gap-3">
                  {renderNetworkInfo(fromNetwork, {
                    mainnet: 1,
                    polygon: 137,
                    bscTestnet: 97,
                    sepolia: 11155111,
                  })}
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showFromNetworkDropdown ? "rotate-180" : ""
                  }`}
                />
              </div>
              {/* Network Dropdown */}
              {showFromNetworkDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {networks.map((network) => (
                    <div
                      key={network.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => handleFromNetworkSelect(network)}
                    >
                      {renderNetworkInfo(network, {
                        mainnet: 1,
                        polygon: 137,
                        bscTestnet: 97,
                        sepolia: 11155111,
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Token and Amount */}
            <div className="flex items-center justify-between">
              <div className="relative" ref={fromTokenRef}>
                <div
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setShowFromTokenDropdown(!showFromTokenDropdown)}
                >
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">
                      {tokenIcons[fromToken] || "$"}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{fromToken}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showFromTokenDropdown ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {/* Token Dropdown */}
                {showFromTokenDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                    {fromNetwork.tokens.map((token) => (
                      <div
                        key={token}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
                        onClick={() => {
                          setFromToken(token);
                          setShowFromTokenDropdown(false);
                        }}
                      >
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs">
                            {tokenIcons[token] || "$"}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{token}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <input
                  type="text"
                  value={fromAmount}
                  onChange={handleFromAmountChange}
                  className="text-2xl font-semibold text-gray-900 bg-transparent border-0 outline-none text-right w-full"
                  placeholder="0"
                />
              </div>
            </div>
            {/* Wallet Balance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                In wallet: {loadingBalance ? '...' : fromTokenBalance !== null ? `${Number(fromTokenBalance) / 1e6} ${fromToken}` : '0'}
                <button onClick={refreshBalance} disabled={loadingBalance} className="ml-1 p-1 rounded hover:bg-gray-200 transition-colors" title="Refresh balance">
                  <RotateCcw className={`w-4 h-4 ${loadingBalance ? 'animate-spin' : ''}`} />
                </button>
              </span>
              <div className="flex items-center gap-2">
                <button className="h-6 px-2 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 bg-transparent border-0 rounded cursor-pointer transition-colors">
                  MAX
                </button>
                <span className="text-gray-500">$0</span>
              </div>
            </div>
          </div>
        </div>
        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="w-10 h-10 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer border-0 transition-all duration-200 shadow-sm hover:scale-105"
          >
            <ArrowUpDown className="w-5 h-5 text-white" />
          </button>
        </div>
        {/* To Network Section */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/30">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">To Network</h3>
            {/* Network Selector */}
            <div className="relative" ref={toNetworkRef}>
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-xl"
                onClick={() => setShowToNetworkDropdown(!showToNetworkDropdown)}
              >
                <div className="flex items-center gap-3">
                  {renderNetworkInfo(toNetwork, {
                    mainnet: 1,
                    polygon: 137,
                    bscTestnet: 97,
                    sepolia: 11155111,
                  })}
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showToNetworkDropdown ? "rotate-180" : ""
                  }`}
                />
              </div>
              {/* Network Dropdown */}
              {showToNetworkDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {networks.map((network) => (
                    <div
                      key={network.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => {
                        setToNetwork(network);
                        setToToken(network.tokens[0]);
                        setShowToNetworkDropdown(false);
                      }}
                    >
                      {renderNetworkInfo(network, {
                        mainnet: 1,
                        polygon: 137,
                        bscTestnet: 97,
                        sepolia: 11155111,
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Token and Amount */}
            <div className="flex items-center justify-between">
              <div className="relative" ref={toTokenRef}>
                <div
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setShowToTokenDropdown(!showToTokenDropdown)}
                >
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">{tokenIcons[toToken] || "$"}</span>
                  </div>
                  <span className="font-medium text-gray-900">{toToken}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showToTokenDropdown ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {/* Token Dropdown */}
                {showToTokenDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                    {toNetwork.tokens.map((token) => (
                      <div
                        key={token}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
                        onClick={() => {
                          setToToken(token);
                          setShowToTokenDropdown(false);
                        }}
                      >
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-xs">
                            {tokenIcons[token] || "$"}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{token}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <input
                  type="text"
                  value={toAmount}
                  onChange={handleToAmountChange}
                  className="text-2xl font-semibold text-gray-900 bg-transparent border-0 outline-none text-right w-full"
                  placeholder="0"
                />
              </div>
            </div>
            {/* Thêm trường nhập địa chỉ nhận */}
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1">Recipient Address (optional)</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={e => setRecipientAddress(e.target.value)}
                placeholder="0x... or Solana address"
                className="w-full p-2 border border-gray-200 text-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
        {/* Bridge Details */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Bridge</span>
            <span className="text-sm font-medium text-gray-900">
              1hoodlabs Bridge
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Transfer time</span>
            <span className="text-sm font-medium text-gray-900">~30 seconds</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Bridge fee</span>
            <span className="text-sm font-medium text-gray-900">
              {loadingBridgeFee ? 'Estimating...' :
                errorBridgeFee ? '~0.0001 ETH' :
                nativeFee !== null ? `${formatEther(nativeFee)} ETH` :
                '~0.0001 ETH'}
            </span>
          </div>
          {/* <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Network fee</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">$23</span>
              <span className="text-xs text-green-600 font-medium">Fast</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div> */}
        </div>
        {/* Transfer Button */}
        <button
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium text-base rounded-xl transition-all duration-200 border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onTransfer}
          disabled={!isWalletConnected || !address}
        >
          Transfer
        </button>
      </div>
    </>
  );
}
