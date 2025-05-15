import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import toast from 'react-hot-toast';

// Pages
import HomePage from './pages/homePages/HomePage';
import TokenCreationPage from './pages/token/TokenCreationPage';
import NFTMarketplacePage from './pages/NFT/NFTMarketplacePage';
import CreateNFTPage from './pages/NFT/CreateNFTPage';
import PortfolioPage from './pages/Dapp/PortfolioPage';
import DigitalAssetExchangePage from './pages/Dapp/DigitalAssetExchangePage';
import AutomatedTokenPurchasePage from './pages/token/AutomatedTokenPurchasePage';
import HeaderNav from './components/homepage/HeaderNav';

function App() {
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
const disconnectWallet = () => {
  setAccount(null);
  setIsConnected(false);
};
  
const connectWallet = async () => {
  // Kiểm tra MetaMask đã cài đặt chưa
  if (!window.ethereum) {
    toast.error("Please install MetaMask!", { duration: 3000 } ) ;
    return;
  }

  try {
    // Kiểm tra xem đã có tài khoản nào được kết nối chưa
    const accounts = await window.ethereum.request({ 
      method: "eth_accounts" 
    });

    // Nếu chưa có tài khoản nào kết nối, yêu cầu kết nối
    if (accounts.length === 0) {
      try {
        const newAccounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        
        if (newAccounts.length > 0) {
          setAccount(newAccounts[0]);
          setIsConnected(true);
          toast.success("Wallet connected successfully!", { duration: 3000 } );
        }
      } catch (requestError) {
        toast.error("User denied account access", { duration: 3000 } );
        return;
      }
    } else {
      // Nếu đã có tài khoản kết nối
      setAccount(accounts[0]);
      setIsConnected(true);
      toast.success("Wallet already connected", { duration: 3000 } );
    }
  } catch (error) {
    console.error("Wallet connection error:", error);
    toast.error("Failed to connect wallet: " + error.message, { duration: 3000 } );
  }
};
  return (
    <Router>
      <div className="App">
        <HeaderNav 
          hoveredNav={hoveredNav}
          setHoveredNav={setHoveredNav}
          isConnected={isConnected}
          setIsConnected={setIsConnected}
          account={account}
          setAccount={setAccount}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-token" element={<TokenCreationPage />} />
          <Route path="/nft-marketplace" element={<NFTMarketplacePage />} />
          <Route path="/create-nft" element={<CreateNFTPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/digital-asset-exchange" element={<DigitalAssetExchangePage />} />
          <Route path="/automated-token-purchase" element={<AutomatedTokenPurchasePage />} />
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
