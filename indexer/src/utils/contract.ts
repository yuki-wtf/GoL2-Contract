import { Contract, RpcProvider } from "starknet";
import { requiredEnv } from "./envs";
import { abi, oldAbi } from "./const";
export const contractAddress = requiredEnv("CONTRACT_ADDRESS");
export const OLD_CONTRACT_BLOCK_END = parseInt(
  requiredEnv("OLD_CONTRACT_BLOCK_END")
);

export const provider = new RpcProvider({
  nodeUrl: process.env.RPC_NODE_URL,
  //   nodeUrl: "https://free-rpc.nethermind.io/goerli-juno",
});

export const oldContract = new Contract(oldAbi, contractAddress, provider);
export const contract = new Contract(abi, contractAddress, provider);
