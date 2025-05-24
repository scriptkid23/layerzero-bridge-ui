import { useWalletClient } from "wagmi";
import { readContract, simulateContract, writeContract } from "wagmi/actions";
import { config } from "../components/Provider";
import { chainConfig } from "../page";
import { bridgeAbi } from "../contracts/bridge";
import { getGasLimitLayerZero } from "../utils";

export function useBridgeContract() {
  const { data: walletClient } = useWalletClient();

  const handleTransfer = async ({
    _payableAmount,
    amount,
    to,
    destinationChain,
    sourceChain,
  }: {
    _payableAmount: bigint;
    amount: bigint;
    to: `0x${string}`;
    destinationChain: string;
    sourceChain: string;
  }) => {
    if (!walletClient) return;

    const bridgeAddress = chainConfig[sourceChain].bridge;
    const tokenAddress = chainConfig[sourceChain].usdt;
    const _dstEid = chainConfig[destinationChain]._dstEid;

    

    if (!bridgeAddress || !_dstEid) return;

   

    try {
      const options = await getGasLimitLayerZero(); 

      const nativeFees = await readContract(config, {
        abi: bridgeAbi,
        address: bridgeAddress as `0x${string}`,
        functionName: "estimateFees",
        args: [_dstEid, tokenAddress as `0x${string}`, amount, to, options as `0x${string}`, false],
      });

      

      const simulation = await simulateContract(config, {
        abi: bridgeAbi,
        address: bridgeAddress as `0x${string}`,
        functionName: "bridge",
        args: [_dstEid, tokenAddress as `0x${string}`, amount, to, options as `0x${string}`],
        value: nativeFees.nativeFee,
        account: walletClient.account,
      });

      const hash = await writeContract(config, {
        ...simulation.request,
        account: walletClient.account,
      });

      return hash;
    } catch (error) {
      console.error("Error in handleTransfer:", error);
      throw error;
    }
  };

  const calculateNativeFees = async (amount: bigint, to: `0x${string}`, destinationChain: string, sourceChain: string) => {
    const bridgeAddress = chainConfig[sourceChain].bridge;
    const tokenAddress = chainConfig[sourceChain].usdt;
    const _dstEid = chainConfig[destinationChain]._dstEid;

    if (!bridgeAddress || !_dstEid) return;

    const options = await getGasLimitLayerZero(); 

    const nativeFees = await readContract(config, {
      abi: bridgeAbi,
      address: bridgeAddress as `0x${string}`,
      functionName: "estimateFees",
      args: [_dstEid, tokenAddress as `0x${string}`, amount, to, options as `0x${string}`, false],
    });

    return nativeFees;
  }

  return { handleTransfer, calculateNativeFees };
}