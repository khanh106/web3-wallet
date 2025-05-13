import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import HeaderNav from '../components/homepage/HeaderNav';
import KpayBalanceCard from '../components/homepage/KpayBalanceCard';
import TokenList from '../components/homepage/TokenList';
import QuickActions from '../components/homepage/QuickActions';
import ToastNotification from '../components/homepage/ToastNotification';
import { styles } from './homepageStyles';

// Import ABI và địa chỉ contract
import KPAY_ABI from '../abi/Kpay.json';
import TOKEN_FACTORY_ABI from '../abi/TokenFactory.json';

// Thay thế bằng địa chỉ thực tế của contract
const KPAY_ADDRESS = '0xa53bc774ED9Ddcc2996c63603E56c8EC11FE665B'; // Địa chỉ contract KPAY
const TOKEN_FACTORY_ADDRESS = '0x421f76C7Dc399a22138277fe8d842003b397F5B0'; // Địa chỉ contract TokenFactory

function PortfolioPage() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [kpayBalance, setKpayBalance] = useState('0');
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredToken, setHoveredToken] = useState(null);
  const [hoveredQuick, setHoveredQuick] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      setToastMsg('Please install MetaMask!');
      setShowToast(true);
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
      setToastMsg('Wallet connected!');
      setShowToast(true);
    } catch (err) {
      setToastMsg('Failed to connect wallet');
      setShowToast(true);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setIsConnected(false);
    setToastMsg('Wallet disconnected');
    setShowToast(true);
  };

  const fetchKpayBalance = async () => {
    if (!isConnected) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const kpayContract = new ethers.Contract(KPAY_ADDRESS, KPAY_ABI.abi, provider);
      const balance = await kpayContract.balanceOf(account);
      setKpayBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching KPAY balance:', error);
    }
  };

  const fetchUserTokens = async () => {
    if (!isConnected) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenFactory = new ethers.Contract(TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI.abi, provider);
      const userTokens = await tokenFactory.getUserTokens(account);
      const tokenDetails = await Promise.all(
        userTokens.map(async (tokenAddress) => {
          const tokenContract = new ethers.Contract(tokenAddress, KPAY_ABI.abi, provider);
          const [name, symbol, balance] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.balanceOf(account)
          ]);
          return {
            address: tokenAddress,
            name,
            symbol,
            balance: ethers.formatEther(balance)
          };
        })
      );
      setTokens(tokenDetails);
    } catch (error) {
      console.error('Error fetching user tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchKpayBalance();
      fetchUserTokens();
    }
  }, [isConnected, account]);

  return (
    <div style={styles.container}>
      <HeaderNav
        account={account}
        isConnected={isConnected}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        hoveredNav={hoveredNav}
        setHoveredNav={setHoveredNav}
        connectWalletButtonStyle={styles.connectWalletButtonStyle}
        disconnectWalletButtonStyle={styles.disconnectWalletButtonStyle}
        walletContainerStyle={styles.walletContainerStyle}
        walletAddressStyle={styles.walletAddressStyle}
      />
      <main style={styles.main}>
        <KpayBalanceCard
          tokenName="KPAY"
          tokenSymbol="KPAY"
          kpayBalance={kpayBalance}
        />
        <TokenList
          tokens={tokens}
          isLoading={isLoading}
          isConnected={isConnected}
          hoveredToken={hoveredToken}
          setHoveredToken={setHoveredToken}
          tokenCardStyle={styles.tokenCardStyle}
          tokenCardHoverStyle={styles.tokenCardHoverStyle}
          tokenLogoStyle={styles.tokenLogoStyle}
          tokenInfoStyle={styles.tokenInfoStyle}
          tokenNameStyle={styles.tokenNameStyle}
          tokenBalanceStyle={styles.tokenBalanceStyle}
          tokenListStyle={styles.tokenListStyle}
        />
        <QuickActions
          handleClick={() => {}}
          hoveredQuick={hoveredQuick}
          setHoveredQuick={setHoveredQuick}
          cardStyle={styles.cardStyle}
          quickActionHoverStyle={styles.quickActionHoverStyle}
        />
      </main>
      <ToastNotification showToast={showToast} toastMsg={toastMsg} />
    </div>
  );
}

export default PortfolioPage;
