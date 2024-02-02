import { Contract, RpcProvider } from "starknet";
import { requiredEnv } from "./envs";
export const contractAddress = requiredEnv("CONTRACT_ADDRESS");
export const OLD_CONTRACT_BLOCK_END = requiredEnv("OLD_CONTRACT_BLOCK_END");

export const provider = new RpcProvider({
    nodeUrl: process.env.RPC_NODE_URL,
  //   nodeUrl: "https://free-rpc.nethermind.io/goerli-juno",
  });

export const contractPromise = new Promise<Contract>((resolve) => {
    provider.getClassAt(contractAddress).then((contract) => {
      resolve(new Contract(contract.abi, contractAddress, provider));
    });
});
  
export const contractOldAbiPromise = new Promise<Contract>((resolve) => {
    provider.getClassAt(contractAddress, OLD_CONTRACT_BLOCK_END).then((contract) => {
        resolve(new Contract(contract.abi, contractAddress, provider));
    });
});
  