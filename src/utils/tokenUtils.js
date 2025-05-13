import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { TOKEN_FACTORY_ADDRESS, KPAY_ADDRESS } from '../config/contracts';
import KPAY_ABI from '../abi/Kpay.json';

const TOKEN_CREATION_FEE = 100; // Kpay

// Minimal ERC20 ABI for allowance and approve
const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

export const approveKpay = async (signer) => {
  try {
    console.log('Starting KPAY approval process...');
    console.log('KPAY Contract Address:', KPAY_ADDRESS);
    console.log('TokenFactory Address:', TOKEN_FACTORY_ADDRESS);
    
    // Sử dụng ERC20_ABI thay vì KPAY_ABI vì chúng ta chỉ cần các hàm cơ bản
    const kpay = new ethers.Contract(KPAY_ADDRESS, ERC20_ABI, signer);
    const feeAmount = ethers.parseUnits(TOKEN_CREATION_FEE.toString(), 18);
    console.log('Fee Amount:', ethers.formatUnits(feeAmount, 18), 'KPAY');
    
    // Check balance first
    const balance = await kpay.balanceOf(await signer.getAddress());
    console.log('KPAY Balance:', ethers.formatUnits(balance, 18), 'KPAY');
    
    if (balance < feeAmount) {
      toast.error(`Insufficient KPAY balance. Required: ${ethers.formatUnits(feeAmount, 18)} KPAY`);
      return false;
    }

    // Check allowance
    const allowance = await kpay.allowance(await signer.getAddress(), TOKEN_FACTORY_ADDRESS);
    console.log('Current Allowance:', ethers.formatUnits(allowance, 18), 'KPAY');
    
    if (allowance >= feeAmount) {
      console.log('Already approved sufficient amount');
      return true;
    }

    // Approve KPAY
    console.log('Approving KPAY...');
    toast.loading('Approving KPAY...');
    const approveTx = await kpay.approve(TOKEN_FACTORY_ADDRESS, feeAmount);
    console.log('Approve transaction hash:', approveTx.hash);
    
    console.log('Waiting for approval confirmation...');
    const receipt = await approveTx.wait();
    console.log('Approval confirmed:', receipt);
    
    toast.success('KPAY approved successfully!');
    return true;
  } catch (error) {
    console.error('Error in approveKpay:', error);
    console.log('Error details:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
    
    toast.error('Failed to approve KPAY: ' + error.message);
    return false;
  }
}; 