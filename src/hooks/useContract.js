import { useContract as useWagmiContract } from '@wagmi/core';
import { ethers } from 'ethers';

export const useContract = (address, abi) => {
  const contract = useWagmiContract({
    address,
    abi,
  });

  return contract;
}; 