import { useWalletClient } from "wagmi";
import { simulateContract, writeContract } from "wagmi/actions";
import { config } from "../components/Provider";
import { usdtAbi } from "../contracts/erc20";


export function useErc20Contract(address: `0x${string}`) {
  const { data: walletClient } = useWalletClient();

  if (!walletClient || !address) return null;

  const transfer = async (to: `0x${string}`, value: bigint) => {
    try {
      const simulation = await simulateContract(config, {
        abi: usdtAbi,
        address,
        functionName: "transfer",
        args: [to, value],
        account: walletClient.account,
      });

      const hash = await writeContract(config, {
        ...simulation.request,
        account: walletClient.account,
      });

      return hash;
    } catch (error) {
      console.error("Error in transfer:", error);
      throw error;
    }
  };

  const approve = async (spender: `0x${string}`, value: bigint) => {
    try {
      const simulation = await simulateContract(config, {
        abi: usdtAbi,
        address,
        functionName: "approve",
        args: [spender, value],
        account: walletClient.account,
      });

      const hash = await writeContract(config, {
        ...simulation.request,
        account: walletClient.account,
      });

      return hash;
    } catch (error) {
      console.error("Error in approve:", error);
      throw error;
    }
  };

  const mint = async (to: `0x${string}`, amount: bigint) => {
    try {
      const simulation = await simulateContract(config, {
        abi: usdtAbi,
        address,
        functionName: "mint",
        args: [to, amount],
        account: walletClient.account,
      });

      const hash = await writeContract(config, {
        ...simulation.request,
        account: walletClient.account,
      });

      return hash;
    } catch (error) {
      console.error("Error in mint:", error);
      throw error;
    }
  };

  return { transfer, approve, mint };
}