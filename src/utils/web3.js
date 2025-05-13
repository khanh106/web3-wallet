import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export const getSigner = async () => {
  if (!window.ethereum) {
    toast.error('MetaMask is not installed!');
    return null;
  }
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log('Connected wallet address:', address);
    return signer;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    toast.error('Error connecting to MetaMask: ' + error.message);
    return null;
  }
}; 