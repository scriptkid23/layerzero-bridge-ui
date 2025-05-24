import { useWalletClient } from "wagmi";
import { simulateContract, writeContract } from "wagmi/actions";
import { config } from "../components/Provider";
import { chainConfig } from "../page";
import { bridgeAbi } from "../contracts/bridge";
import { getGasLimitLayerZero } from "../utils";

export function useBridgeContract() {
  const { data: walletClient } = useWalletClient();

  const handleTransfer = async ({
    _payableAmount,
    _dstEid,
    token,
    amount,
    to,
    chain,
  }: {
    _payableAmount: bigint;
    _dstEid: number;
    token: `0x${string}`;
    amount: bigint;
    to: `0x${string}`;
    chain: string;
  }) => {
    if (!walletClient) return;

    const bridgeAddress = chainConfig[chain].bridge;
    if (!bridgeAddress) return;

    try {
      const options = await getGasLimitLayerZero(); 
      const simulation = await simulateContract(config, {
        abi: bridgeAbi,
        address: bridgeAddress as `0x${string}`,
        functionName: "bridge",
        args: [_dstEid, token, amount, to, options as `0x${string}`],
        value: _payableAmount,
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

  return { handleTransfer };
}