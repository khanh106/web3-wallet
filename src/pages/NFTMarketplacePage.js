import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import NFTMarketplaceABI from '../abi/NFTMarketplace.json';
import KpayABI from '../abi/Kpay.json';
import WalletInfo from '../components/NFTMarketplacePage/WalletInfo';
import NFTList from '../components/NFTMarketplacePage/NFTList';
import './NFTMarketplacePage.css';

const NFTMarketplacePage = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [nftMarketplace, setNftMarketplace] = useState(null);
  const [kpayToken, setKpayToken] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contract addresses
  const NFT_MARKETPLACE_ADDRESS = "0x874969a25a88b592A66D3811b2FeAE7BC851c687";
  const KPAY_TOKEN_ADDRESS = "0xa53bc774ED9Ddcc2996c63603E56c8EC11FE665B";

  useEffect(() => {
    connectWallet();
    loadContracts();
  }, []);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAccount(accounts[0]);
      } else {
        setError('Please install MetaMask!');
      }
    } catch (error) {
      setError('Error connecting to wallet');
    }
  };

  const loadContracts = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      try {
        const nftMarketplaceContract = new ethers.Contract(
          NFT_MARKETPLACE_ADDRESS,
          NFTMarketplaceABI,
          signer
        );

        const kpayTokenContract = new ethers.Contract(
          KPAY_TOKEN_ADDRESS,
          KpayABI,
          signer
        );

        setNftMarketplace(nftMarketplaceContract);
        setKpayToken(kpayTokenContract);

        loadNFTs(nftMarketplaceContract).catch(e => {
          console.error("Error in loadNFTs:", e);
          setError("Error loading NFTs");
        });
      } catch (error) {
        console.error("Error creating contract instances:", error);
        setError('Error loading contracts');
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setError('Error loading contracts');
    }
  };

  const loadNFTs = async (contract) => {
    try {
      setLoading(true);
      const totalSupply = await contract.getCurrentTokenId();
      const nftList = [];

      for (let i = 1; i <= totalSupply; i++) {
        const listing = await contract.nftListings(i);
        if (listing.isListed) {
          const tokenURI = await contract.tokenURI(i);
          nftList.push({
            tokenId: i,
            seller: listing.seller,
            price: ethers.formatEther(listing.price),
            tokenURI,
            isListed: listing.isListed
          });
        }
      }

      setNfts(nftList);
      setLoading(false);
    } catch (error) {
      setError('Error loading NFTs');
      setLoading(false);
    }
  };

  const handleCreateNFT = () => {
    navigate('/create-nft');
  };

  return (
    <div className="marketplace-page">
      <div className="container">
        <div className="marketplace-header">
          <WalletInfo account={account} />
          <button className="create-nft-button" onClick={handleCreateNFT}>
            Create New NFT
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        <NFTList nfts={nfts} loading={loading} />
      </div>
    </div>
  );
};

export default NFTMarketplacePage;
