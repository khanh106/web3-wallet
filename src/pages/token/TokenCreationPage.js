import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';
import TokenForm from '../../components/TokenCreationPage/TokenForm';
import TokenPreview from '../../components/TokenCreationPage/TokenPreview';
import CreationSteps from '../../components/TokenCreationPage/CreationSteps';
import './TokenCreationPage.css';

// Import ABI và địa chỉ
import TOKEN_FACTORY_ABI from '../../abi/TokenFactory.json';
import { TOKEN_FACTORY_ADDRESS, KPAY_ADDRESS } from '../../config/contracts';
import { getSigner } from '../../utils/web3';
import { approveKpay } from '../../utils/tokenUtils';

// Constants
const TOKEN_CREATION_FEE = 100;
const MAX_RETRY_ATTEMPTS = 3;
const TRANSACTION_TIMEOUT = 300000; // 5 minutes
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Minimal ERC20 ABI
const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

// Validation rules
const VALIDATION_RULES = {
  name: {
    minLength: 3,
    maxLength: 50,
    required: true,
    pattern: /^[a-zA-Z0-9\s-]+$/
  },
  symbol: {
    minLength: 2,
    maxLength: 10,
    pattern: /^[A-Za-z0-9]+$/,
    required: true
  },
  totalSupply: {
    min: 0.000001,
    max: 1000000000,
    required: true
  },
  decimals: {
    min: 0,
    max: 18,
    required: true
  },
  description: {
    maxLength: 500,
    required: false
  }
};

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
  const [isApproving, setIsApproving] = useState(false);

  // Memoized validation function
  const validateForm = useCallback(() => {
    const errors = [];
    
    Object.entries(VALIDATION_RULES).forEach(([field, rules]) => {
      const value = tokenData[field];
      
      if (rules.required && !value) {
        errors.push(`${field} is required`);
        return;
      }
      
      if (value) {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
        
        if (rules.min && Number(value) < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        
        if (rules.max && Number(value) > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    
    return true;
  }, [tokenData]);

  // Memoized input handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'decimals') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 18) {
        toast.error('Decimals must be between 0 and 18');
        return;
      }
      setTokenData(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'symbol') {
      if (!/^[A-Za-z0-9]*$/.test(value)) {
        toast.error('Symbol can only contain letters and numbers');
        return;
      }
      setTokenData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setTokenData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  // Memoized logo handler
  const handleLogoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG or GIF');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size too large. Maximum size is 5MB');
      return;
    }

    setTokenData(prev => ({ ...prev, logo: file }));
  }, []);

  // Memoized transaction handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    let retryCount = 0;
    
    while (retryCount < MAX_RETRY_ATTEMPTS) {
      try {
        const signer = await getSigner();
        if (!signer) {
          toast.error('Please connect your wallet');
          return;
        }

        // Approve KPAY
        setIsApproving(true);
        const approved = await approveKpay(signer);
        if (!approved) {
          toast.error('KPAY approval failed');
          return;
        }
        setIsApproving(false);

        // Create token factory instance
        const tokenFactory = new ethers.Contract(
          TOKEN_FACTORY_ADDRESS,
          TOKEN_FACTORY_ABI.abi || TOKEN_FACTORY_ABI,
          signer
        );

        // Check creation fee
        const creationFee = await tokenFactory.CREATION_FEE();
        
        // Check KPAY balance and allowance
        const kpay = new ethers.Contract(KPAY_ADDRESS, ERC20_ABI, signer);
        const userAddress = await signer.getAddress();
        const [balance, allowance] = await Promise.all([
          kpay.balanceOf(userAddress),
          kpay.allowance(userAddress, TOKEN_FACTORY_ADDRESS)
        ]);
        
        if (balance < creationFee) {
          toast.error(`Insufficient KPAY balance. Required: ${ethers.formatUnits(creationFee, 18)} KPAY`);
          return;
        }
        
        if (allowance < creationFee) {
          toast.error(`Insufficient KPAY allowance. Required: ${ethers.formatUnits(creationFee, 18)} KPAY`);
          return;
        }

        // Calculate total supply
        const totalSupply = ethers.parseUnits(tokenData.totalSupply.toString(), 18);
        
        // Estimate gas
        const gasEstimate = await tokenFactory.createToken.estimateGas(
          tokenData.name,
          tokenData.symbol,
          totalSupply
        );

        // Send transaction with timeout
        const tx = await Promise.race([
          tokenFactory.createToken(
            tokenData.name,
            tokenData.symbol,
            totalSupply,
            { gasLimit: gasEstimate.mul(120).div(100) } // Add 20% buffer
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction timeout')), TRANSACTION_TIMEOUT)
          )
        ]);

        toast.loading('Transaction submitted. Waiting for confirmation...');
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
          toast.success('Token created successfully!');
          navigate('/tokens');
          break;
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        retryCount++;
        if (retryCount === MAX_RETRY_ATTEMPTS) {
          handleError(error);
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }, [tokenData, validateForm, navigate]);

  // Memoized error handler
  const handleError = useCallback((error) => {
    console.error('Error in handleSubmit:', error);
    
    let errorMessage = 'Failed to create token';
    if (error.message.includes('user rejected')) {
      errorMessage = 'Transaction was rejected by user';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds for gas * price + value';
    } else if (error.message.includes('execution reverted')) {
      errorMessage = 'Transaction reverted. Please check your input values and try again.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Transaction timed out. Please try again.';
    }
    
    toast.error(errorMessage);
  }, []);

  // Memoized step handlers
  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Memoized form props
  const formProps = useMemo(() => ({
    tokenData,
    handleInputChange,
    handleLogoChange,
    handleSubmit,
    isLoading,
    isApproving,
    currentStep,
    nextStep,
    prevStep
  }), [
    tokenData,
    handleInputChange,
    handleLogoChange,
    handleSubmit,
    isLoading,
    isApproving,
    currentStep,
    nextStep,
    prevStep
  ]);

  return (
    <div className="token-creation-container" data-testid="token-creation-page">
      <Toaster position="top-right" />
      <div className="token-creation-content">
        <h1>Create New Token</h1>
        <CreationSteps currentStep={currentStep} />
        <div className="token-creation-form-container">
          <TokenForm {...formProps} />
          <TokenPreview tokenData={tokenData} />
        </div>
      </div>
    </div>
  );
}

export default React.memo(TokenCreationPage);