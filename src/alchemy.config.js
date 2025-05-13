import { Network, Alchemy } from "alchemy-sdk";

const settings = {
  apiKey: "sxPOpZKH9ahDrydeoG3auHDISSn2yV6x", // Thay thế bằng API key của bạn
  network: Network.ETH_SEPOLIA,
};

export const alchemy = new Alchemy(settings);