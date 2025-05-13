import { Network, Alchemy } from "alchemy-sdk";
import dotenv from "dotenv";

dotenv.config();

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};

export const alchemy = new Alchemy(settings);
