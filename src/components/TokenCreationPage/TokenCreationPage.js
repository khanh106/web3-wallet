import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import TokenForm from './TokenForm';
import TokenPreview from './TokenPreview';
import CreationSteps from './CreationSteps';
import toast from 'react-hot-toast';
import './TokenCreationPage.css';

// Import ABI và địa chỉ
import TOKEN_FACTORY_ABI from '../../abi/TokenFactory.json';
import KPAY_ABI from '../../Kpay.json';

const TOKEN_FACTORY_ADDRESS = '0x421f76C7Dc399a22138277fe8d842003b397F5B0';
const KPAY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Thay bằng địa chỉ KPAY thực tế
const TOKEN_CREATION_FEE = 100; // Thay bằng phí thực tế

// Minimal ERC20 ABI for allowance and approve
const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

const TokenCreationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    decimals: 18,
    description: '',
    logo: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!tokenData.name.trim()) {
      toast.error('Please enter token name');
      return false;
    }
    if (!tokenData.symbol.trim()) {
      toast.error('Please enter token symbol');
      return false;
    }
    if (!tokenData.totalSupply || isNaN(tokenData.totalSupply) || Number(tokenData.totalSupply) <= 0) {
      toast.error('Please enter a valid total supply');
      return false;
    }
    if (tokenData.decimals < 0 || tokenData.decimals > 18) {
      toast.error('Decimals must be between 0 and 18');
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'decimals') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 18) {
        toast.error('Decimals must be between 0 and 18');
        return;
      }
      setTokenData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setTokenData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTokenData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const getSigner = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed!');
      return null;
    }
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      return provider.getSigner();
    } catch (error) {
      toast.error('Error connecting to MetaMask: ' + error.message);
      return null;
    }
  };

  const approveKpay = async (signer) => {
    try {
      // Sử dụng ERC20_ABI thay vì KPAY_ABI
      const kpay = new ethers.Contract(KPAY_ADDRESS, ERC20_ABI, signer);
      const feeAmount = ethers.parseUnits(TOKEN_CREATION_FEE.toString(), 18);
      
      // Check balance first
      const balance = await kpay.balanceOf(await signer.getAddress());
      if (balance < feeAmount) {
        toast.error('Insufficient KPAY balance');
        return false;
      }

      // Check allowance
      const allowance = await kpay.allowance(await signer.getAddress(), TOKEN_FACTORY_ADDRESS);
      console.log('Current allowance:', ethers.formatUnits(allowance, 18));
      
      if (allowance >= feeAmount) {
        console.log('Already approved');
        return true;
      }

      // Approve KPAY
      toast.info('Approving KPAY...');
      const approveTx = await kpay.approve(TOKEN_FACTORY_ADDRESS, feeAmount);
      await approveTx.wait();
      toast.success('KPAY approved successfully!');
      return true;
    } catch (error) {
      console.error('Error approving KPAY:', error);
      // Log thêm thông tin để debug
      console.log('KPAY Address:', KPAY_ADDRESS);
      console.log('Signer Address:', await signer.getAddress());
      console.log('Fee Amount:', ethers.formatUnits(feeAmount, 18));
      
      toast.error('Failed to approve KPAY: ' + error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const signer = await getSigner();
      if (!signer) return;

      // Log token data for debugging
      console.log('Creating token with data:', {
        name: tokenData.name,
        symbol: tokenData.symbol,
        totalSupply: tokenData.totalSupply,
        decimals: tokenData.decimals
      });

      // Approve KPAY first
      const approved = await approveKpay(signer);
      if (!approved) return;

      const tokenFactory = new ethers.Contract(
        TOKEN_FACTORY_ADDRESS,
        TOKEN_FACTORY_ABI.abi,
        signer
      );

      const totalSupply = ethers.parseUnits(
        tokenData.totalSupply.toString(),
        Number(tokenData.decimals)
      );

      toast.info('Creating token...');
      const tx = await tokenFactory.createToken(
        tokenData.name,
        tokenData.symbol,
        totalSupply,
        Number(tokenData.decimals)
      );

      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success('Token created successfully!');
        navigate('/tokens');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      let errorMessage = 'Failed to create token';
      
      // Try to extract more specific error message
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas * price + value';
      } else if (error.message.includes('execution reverted')) {
        errorMessage = 'Transaction reverted. Please check your input values and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="token-creation-container">
      <div className="token-creation-content">
        <h1>Create New Token</h1>
        <CreationSteps currentStep={currentStep} />
        <div className="token-creation-form-container">
          <TokenForm
            tokenData={tokenData}
            handleInputChange={handleInputChange}
            handleLogoChange={handleLogoChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            currentStep={currentStep}
            nextStep={nextStep}
            prevStep={prevStep}
          />
          <TokenPreview tokenData={tokenData} />
        </div>
      </div>
    </div>
  );
};

export default TokenCreationPage; 