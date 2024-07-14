import { ethers } from 'ethers';
import { FACTORY_ABI, OPP_ABI } from '../artifacts/abi';

export function getProvider() {
  const chainRpc = process.env.BASE_SEPOLIA_RPC_URL;

  return new ethers.JsonRpcProvider(chainRpc);
}

export async function getAdjustedGasPrice() {
  const chainRpc = process.env.BASE_SEPOLIA_RPC_URL;

  // Request gas price from the chain via JSON RPC
  const request = {
    method: 'eth_gasPrice',
    params: [],
    id: 1,
    jsonrpc: '2.0',
  };
  const response = await fetch(chainRpc, {
    body: JSON.stringify(request),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const responseData = await response.json();
  const gasPrice = responseData.result;

  // The gas price (in wei)...
  const adjustedGasPrice = (BigInt(gasPrice) * 110n) / 100n; // 10% higher than the current gas price
  console.log(
    `Gas now is : ${ethers.formatUnits(
      gasPrice,
      'gwei',
    )} gwei. Adding 10% to ensure transaction goes through`,
  );
  return adjustedGasPrice;
}

export function getSignerWallet() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error(`Web3ProviderService: Private key not found`);
    throw new Error(`Private key not found`);
  }

  return new ethers.Wallet(privateKey, getProvider());
}

export function getFactory(
  address: string,
  runner?: ethers.Signer | ethers.Provider,
): ethers.Contract {
  return new ethers.Contract(address, FACTORY_ABI, runner ?? getProvider());
}

export function getOpportunityContract(
  address: string,
  runner?: ethers.Signer | ethers.Provider,
): ethers.Contract {
  return new ethers.Contract(address, OPP_ABI, runner ?? getProvider());
}
