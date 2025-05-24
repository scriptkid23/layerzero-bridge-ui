import { Options } from "@layerzerolabs/lz-v2-utilities";

export const getGasLimitLayerZero = async (
 
) => {
  return await Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString();
  
};