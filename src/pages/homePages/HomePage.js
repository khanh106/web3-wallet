import React,{ useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { FaWallet, FaCoins, FaExchangeAlt, FaChartLine } from 'react-icons/fa';
import "./HomePage.css";
import NFT_MARKETPLACE_ABI from "../../abi/NFTMarketplace.json";
import KPAY_ABI from "../../abi/Kpay.json";

import HeaderNav from "../../components/homepage/HeaderNav";
import KpayBalanceCard from "../../components/homepage/KpayBalanceCard";
import TokenList from "../../components/homepage/TokenList";
import QuickActions from "../../components/homepage/QuickActions";
import ToastNotification from "../../components/homepage/ToastNotification";

const HomePage = () => {
  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [kpayBalance, setKpayBalance] = useState("0");
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nftMarketplaceContract, setNftMarketplaceContract] = useState(null);
  const [kpayContract, setKpayContract] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [hoveredNav, setHoveredNav] = useState(null);


  // contract addresses
  const NFT_MARKETPLACE_ADDRESS =  "0x874969a25a88b592A66D3811b2FeAE7BC851c687";
  const KPAY_ADDRESS = "0xa53bc774ED9Ddcc2996c63603E56c8EC11FE665B";

  // useEffect(() => {
  //     connectWallet();
  //     loadContract(); 
    
  // }, []);

// const connectWallet = async () => {
//   // Kiểm tra MetaMask đã cài đặt chưa
//   if (!window.ethereum) {
//     toast.error("Please install MetaMask!", { duration: 3000 });
//     return;
//   }

//   try {
//     // Kiểm tra xem đã có tài khoản nào được kết nối chưa
//     const accounts = await window.ethereum.request({ 
//       method: "eth_accounts" 
//     });

//     // Nếu chưa có tài khoản nào kết nối, yêu cầu kết nối
//     if (accounts.length === 0) {
//       try {
//         const newAccounts = await window.ethereum.request({
//           method: "eth_requestAccounts"
//         });
        
//         if (newAccounts.length > 0) {
//           setAccount(newAccounts[0]);
//           setIsConnected(true);
//           toast.success("Wallet connected successfully!", { duration: 3000 });
//         }
//       } catch (requestError) {
//         toast.error("User denied account access", { duration: 3000 });
//         return;
//       }
//     } else {
//       // Nếu đã có tài khoản kết nối
//       setAccount(accounts[0]);
//       setIsConnected(true);
//       toast.success("Wallet already connected", { duration: 3000 });
//     }
//   } catch (error) {
//     console.error("Wallet connection error:", error);
//     toast.error("Failed to connect wallet: " + error.message, { duration: 3000 });
//   }
// };
  
  const loadContract = async () => {
    try{
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      try{
        const nftMarketplaceContract= new ethers.Contract(NFT_MARKETPLACE_ADDRESS, NFT_MARKETPLACE_ABI.abi, signer);
        const kpayContract = new ethers.Contract(KPAY_ADDRESS, KPAY_ABI.abi, signer);
        setNftMarketplaceContract(nftMarketplaceContract);
        setKpayContract(kpayContract);
        
        loadNFTs(nftMarketplaceContract).catch(e=>{
          console.error("Error loading NFTs:", e);
          setError("Error loading NFTs");
        });

      }catch(error){
        console.error("Error creating contract istance", error);
        setError("Error loading contract");
      }
    }catch(error){
      console.error("Error cconneting to wallet", error);
      setError("Error loading contract");
    }
  };
  
    const loadNFTs = async (contract) => {
      try{
        setLoading(true);
        const totalSupply = await contract.getCurrentTokenId();
        const nftList = [];

        for(let i=1; i<=totalSupply; i++){
            const listing = await contract.nftListings(i);
          if(listing.isListed){
            const tokenURI = await contract.tokenURI(i);
            nftList.push({
              tokenId: i,
              seller: listing.seller,
               price: formatEther(listing.price), 
              tokenURI,
              isListed: listing.isListed,
          });
        }
      }
      
      setTokens(nftList);
      setLoading(false);
    }catch(error){
      setError("Error loading NFTs");
      setLoading(false);
    }
  };

  const handleCreateNFT = async () => {
    navigate('/create-nft');
  };

  const disconnectWallet = () => {
    setAccount("");
    setIsConnected(false);
    setKpayBalance("0");
    setTokens([]);
    toast.success("Wallet disconnected");
  };

  return (
    <div className="home-container">
      {/* Header */}
      {/* <HeaderNav
        account={account}
        isConnected={isConnected}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        hoveredNav={hoveredNav}
        setHoveredNav={setHoveredNav}
      />   */}
      {/* <header className="header">
        <div className="logo">KPAY DEX</div>
        <div className="wallet-section">
          {!isConnected ? (
            <button className="connect-btn" onClick={connectWallet}>
              <FaWallet /> Connect Wallet
            </button>
          ):(
            <div className="connected-wallet">
              <span className="wallet-address">{account.slice(0,6)}...{account.slice(-4)}
              </span>
              <button className="disconnect-btn" onClick={disconnectWallet}>disconnect</button>
            </div>
          )}
          
    </div>
    </header> */}

    {/* hero section */}
  <section className="hero-section">
    <h1>Welcome to KPAY DEX</h1>
    <p clasName="subtitle">Create, buy and sell NFTs with ease. Experience the future of decentralized finance.</p>
    <div className="cta-buttons">
    <button className="create-token-btn" onClick={() => navigate("/create-token")}>
            Create Token
          </button>
          <button className="view-tokens-btn" onClick={() => navigate("/nft-marketplace")}>
            Explore NFTs
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose KPAY DEX?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaCoins className="feature-icon" />
            <h3>Create Tokens</h3>
            <p>Launch your own tokens with just a few clicks. No coding required.</p>
          </div>
          <div className="feature-card">
            <FaExchangeAlt className="feature-icon" />
            <h3>Trade NFTs</h3>
            <p>Buy, sell, and trade NFTs in our secure marketplace.</p>
          </div>
          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>Track Portfolio</h3>
            <p>Monitor your assets and track your portfolio performance.</p>
          </div>
        </div>
      </section>

      {/* Portfolio Section - Only show when wallet is connected */}
      {isConnected && (
        <section className="portfolio-section">
          <h2>Your Portfolio</h2>
          <div className="kpay-balance-card">
            <div className="balance-header">
              <FaCoins className="balance-icon" />
              <h3>KPAY Balance</h3>
            </div>
            <div className="balance-amount">{kpayBalance} KPAY</div>
          </div>

          <div className="token-list">
            {isLoading ? (
              <div className="loading-spinner" />
            ) : tokens.length > 0 ? (
              tokens.map((token) => (
                <div key={token.address} className="token-card">
                  <div className="token-info">
                    <div className="token-logo">{token.symbol[0]}</div>
                    <div className="token-details">
                      <h3>{token.name}</h3>
                      <p>{token.balance} {token.symbol}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-tokens">No tokens found in your wallet</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
   
