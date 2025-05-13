import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';
import TokenForm from '../components/TokenCreationPage/TokenForm';
import TokenPreview from '../components/TokenCreationPage/TokenPreview';
import CreationSteps from '../components/TokenCreationPage/CreationSteps';
import './TokenCreationPage.css';

// Import ABI và địa chỉ
import TOKEN_FACTORY_ABI from '../abi/TokenFactory.json';
import { TOKEN_FACTORY_ADDRESS, KPAY_ADDRESS } from '../config/contracts';
import { getSigner } from '../utils/web3';
import { approveKpay } from '../utils/tokenUtils';

const TOKEN_CREATION_FEE = 100; // Kpay

// Minimal ERC20 ABI for allowance and approve
const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

function TokenCreationPage() {
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
    if (tokenData.name.length < 3) {
      toast.error('Token name must be at least 3 characters long');
      return false;
    }
    if (!tokenData.symbol.trim()) {
      toast.error('Please enter token symbol');
      return false;
    }
    if (tokenData.symbol.length < 2) {
      toast.error('Token symbol must be at least 2 characters long');
      return false;
    }
    if (!/^[A-Za-z0-9]+$/.test(tokenData.symbol)) {
      toast.error('Token symbol can only contain letters and numbers');
      return false;
    }
    if (!tokenData.totalSupply || isNaN(tokenData.totalSupply) || Number(tokenData.totalSupply) <= 0) {
      toast.error('Please enter a valid total supply');
      return false;
    }
    if (Number(tokenData.totalSupply) < 0.000001) {
      toast.error('Total supply must be at least 0.000001');
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
    } else if (name === 'symbol') {
      // Chỉ cho phép chữ cái và số
      if (!/^[A-Za-z0-9]*$/.test(value)) {
        toast.error('Symbol can only contain letters and numbers');
        return;
      }
      setTokenData(prev => ({
        ...prev,
        [name]: value.toUpperCase() // Chuyển symbol thành chữ hoa
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      console.log('Starting token creation process...');
      const signer = await getSigner();
      if (!signer) return;

      // Log token data for debugging
      console.log('Token creation data:', {
        name: tokenData.name,
        symbol: tokenData.symbol,
        totalSupply: tokenData.totalSupply,
        decimals: tokenData.decimals,
        description: tokenData.description
      });

      // Approve KPAY first
      console.log('Approving KPAY...');
      const approved = await approveKpay(signer);
      if (!approved) {
        console.log('KPAY approval failed');
        return;
      }
      console.log('KPAY approval successful');

      console.log('Creating token contract instance...');
      console.log('TokenFactory ABI:', TOKEN_FACTORY_ABI);
      const tokenFactory = new ethers.Contract(
        TOKEN_FACTORY_ADDRESS,
        TOKEN_FACTORY_ABI.abi || TOKEN_FACTORY_ABI,
        signer
      );

      // Check creation fee
      const creationFee = await tokenFactory.CREATION_FEE();
      console.log('Creation fee:', ethers.formatUnits(creationFee, 18), 'KPAY');

      // Check KPAY balance and allowance again
      const kpay = new ethers.Contract(KPAY_ADDRESS, ERC20_ABI, signer);
      const userAddress = await signer.getAddress();
      const balance = await kpay.balanceOf(userAddress);
      const allowance = await kpay.allowance(userAddress, TOKEN_FACTORY_ADDRESS);
      
      console.log('KPAY Balance:', ethers.formatUnits(balance, 18), 'KPAY');
      console.log('KPAY Allowance:', ethers.formatUnits(allowance, 18), 'KPAY');
      
      if (balance < creationFee) {
        toast.error(`Insufficient KPAY balance. Required: ${ethers.formatUnits(creationFee, 18)} KPAY`);
        return;
      }
      
      if (allowance < creationFee) {
        toast.error(`Insufficient KPAY allowance. Required: ${ethers.formatUnits(creationFee, 18)} KPAY`);
        return;
      }

      // Tính totalSupply với decimals = 18 (vì contract ERC20Token mặc định dùng 18 decimals)
      const totalSupply = ethers.parseUnits(
        tokenData.totalSupply.toString(),
        18 // Luôn dùng 18 decimals vì contract ERC20Token mặc định dùng 18
      );
      console.log('Total Supply (wei):', totalSupply.toString());

      // Validate total supply
      if (totalSupply <= 0) {
        toast.error('Total supply must be greater than 0');
        return;
      }

      console.log('Calling createToken...');
      toast.loading('Creating token...');
      
      // Estimate gas first
      try {
        console.log('Estimating gas with params:', {
          name: tokenData.name,
          symbol: tokenData.symbol,
          totalSupply: totalSupply.toString()
        });
        
        const gasEstimate = await tokenFactory.createToken.estimateGas(
          tokenData.name,
          tokenData.symbol,
          totalSupply
        );
        console.log('Gas estimate:', gasEstimate.toString());
      } catch (error) {
        console.error('Gas estimation failed:', error);
        console.log('Error details:', {
          message: error.message,
          code: error.code,
          data: error.data
        });
        toast.error('Failed to estimate gas. Please check your input values.');
        return;
      }

      console.log('Sending createToken transaction...');
      const tx = await tokenFactory.createToken(
        tokenData.name,
        tokenData.symbol,
        totalSupply
      );
      console.log('Create token transaction hash:', tx.hash);

      console.log('Waiting for transaction confirmation...');
      toast.loading('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      
      if (receipt.status === 1) {
        console.log('Token created successfully!');
        toast.success('Token created successfully!');
        navigate('/tokens');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      console.log('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data
      });
      
      let errorMessage = 'Failed to create token';
      
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
      <Toaster position="top-right" />
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
}

export default TokenCreationPage;
