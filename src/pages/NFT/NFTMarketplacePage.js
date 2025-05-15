import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import NFTMarketplaceABI from '../../abi/NFTMarketplace.json';
import KpayABI from '../../abi/Kpay.json';
import WalletInfo from '../../components/NFTMarketplacePage/WalletInfo';
import NFTList from '../../components/NFTMarketplacePage/NFTList';
import './NFTMarketplacePage.css';
import listNFT from '../../components/NFTMarketplacePage/listNFT';
import ListNFTForm from '../../components/NFTMarketplacePage/ListNFTForm';
import MyNFTs from '../../components/NFTMarketplacePage/MyNFTs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from '../../components/Toast';


const NFTMarketplacePage = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [nftMarketplace, setNftMarketplace] = useState(null);
  const [kpayToken, setKpayToken] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);


  // Contract addresses
  const NFT_MARKETPLACE_ADDRESS = "0x874969a25a88b592A66D3811b2FeAE7BC851c687";
  const KPAY_TOKEN_ADDRESS = "0xa53bc774ED9Ddcc2996c63603E56c8EC11FE665B";

  useEffect(() => {
    connectWallet();
    loadContracts();
  }, []);


const handleSelectNFT = (nft) => {
  setSelectedNFT(nft);
};

const handleListNFT = async (tokenId, price) => {
  try {
    if (!nftMarketplace || !kpayToken) {
      setError('Contracts not loaded');
      return;
    }

    const priceInWei = ethers.parseEther(price.toString());

    // Approve KPAY token spending
    const approveTx = await kpayToken.approve(
      NFT_MARKETPLACE_ADDRESS,
      priceInWei
    );
    await approveTx.wait();

    // List NFT on marketplace
    const listTx = await nftMarketplace.listItem(tokenId, priceInWei,{ gasLimit: 500000 });
    await listTx.wait();

    // Reload NFTs after listing
    await loadNFTs(nftMarketplace);
    toast.success('NFT listed successfully!');
    setSelectedNFT(null); // Reset selected NFT
    
    return true;
  } catch (error) {
    console.error("Error listing NFT:", error);
    setError('Error listing NFT. Please try again.');
    return false;
  }
};

 const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      setError('Please install MetaMask!');
      return;
    }

    // Check if MetaMask is locked
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });

    if (accounts.length === 0) {
      // MetaMask is locked, request connection
      const newAccounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(newAccounts[0]);
    } else {
      setAccount(accounts[0]);
    }
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    if (error.code === -32002) {
      setError('Please check your MetaMask window and approve the connection request');
    } else {
      setError('Error connecting to wallet. Please make sure MetaMask is installed and unlocked.');
    }
  }
};

  const loadContracts = async () => {
    try {
      if(!window.ethereum) {
        setError('Please install MetaMask!');
        return;
      }
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
          KpayABI.abi,
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
          console.log(`Token ${i} URI:`, tokenURI); // Thêm dòng này để debug
        
        // Kiểm tra xem tokenURI có phải là URL hợp lệ không
        if (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs')) {
          try {
            const response = await fetch(tokenURI);
            const metadata = await response.json();
            console.log(`Token ${i} Metadata:`, metadata); // Thêm dòng này để debug
            
            nftList.push({
              tokenId: i,
              seller: listing.seller,
              price: ethers.formatEther(listing.price),
              tokenURI: metadata.image || tokenURI, // Sử dụng image từ metadata nếu có
              name: metadata.name,
              description: metadata.description,
              isListed: listing.isListed
            });
          } catch (error) {
            console.error(`Error fetching metadata for token ${i}:`, error);
            // Fallback to tokenURI if metadata fetch fails
          nftList.push({
              tokenId: i,
              seller: listing.seller,
              price: ethers.formatEther(listing.price),
              tokenURI,
              isListed: listing.isListed
            });
          }
        } else {
          console.warn(`Invalid tokenURI for token ${i}:`, tokenURI);
        }
      }
    }

      setNfts(nftList);
      setLoading(false);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setError('Error loading NFTs');
      setLoading(false);
    }
  };

  const handleCreateNFT = () => {
    navigate('/create-nft');
  };

  // Hàm mua NFT
const handleBuyNFT = async (tokenId, price) => {
  try {
    if (!nftMarketplace || !kpayToken) {
      showToast.error('Contracts not loaded');
      return;
    }

    const priceInWei = ethers.parseEther(price.toString());

    // Approve KPAY token spending
    const approveTx = await kpayToken.approve(
      NFT_MARKETPLACE_ADDRESS,
      priceInWei
    );
    await approveTx.wait();

    // Mua NFT
    const buyTx = await nftMarketplace.buyNFT(tokenId, { gasLimit: 500000 });
    await buyTx.wait();

    // Reload danh sách NFT
    await loadNFTs(nftMarketplace);
    
    showToast.success('NFT purchased successfully!');
    
  } catch (error) {
    console.error("Error buying NFT:", error);
    showToast.error('Error buying NFT. Please try again.');
  }
};

// Hàm gỡ NFT xuống
const handleUnlistNFT = async (tokenId) => {
  try {
    if (!nftMarketplace) {
      showToast.error('Contract not loaded');
      return;
    }

    // Gỡ NFT xuống
    const unlistTx = await nftMarketplace.cancelListing(tokenId, { gasLimit: 500000 });
    await unlistTx.wait();

    // Reload danh sách NFT
    await loadNFTs(nftMarketplace);
    
    showToast.success('NFT unlisted successfully!');
    
  } catch (error) {
    console.error("Error unlisting NFT:", error);
    showToast.error('Error unlisting NFT. Please try again.');
  }
};

 return (
  <div className="marketplace-page">
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    <div className="container">
      <div className="marketplace-header">
        <WalletInfo account={account} />
        <button className="create-nft-button" onClick={handleCreateNFT}>
          + Create New NFT
        </button>
      </div>
      {error && <div className="error">{error}</div>}

      {/* Add MyNFTs component */}
      <MyNFTs 
        nftMarketplace={nftMarketplace}
        account={account}
        onSelectNFT={handleSelectNFT}
      />

      <ListNFTForm 
        selectedNFT={selectedNFT}
        onList={handleListNFT}
      />
      
      {loading ? (
        <div className="loading">Loading NFTs...</div>
      ) : (
        <div className="nft-grid">
          {nfts.length === 0 ? (
            <div className="no-nft">No NFTs listed yet.</div>
          ) : (
            nfts.map(nft => (
              <div className="nft-card" key={nft.tokenId}>
                <img 
                  className="nft-image" 
                  src={nft.tokenURI} 
                  alt={nft.name || `NFT #${nft.tokenId}`} 
                />
                <div className="nft-info">
                  <h3 className="nft-title">
                    {nft.name || `NFT #${nft.tokenId}`}
                  </h3>
                  <p className="nft-desc">
                    {nft.description || "No description"}
                  </p>
                  <div className="nft-meta">
                    <span className="nft-price">{nft.price} KPAY</span>
                    <span className="nft-seller">
                      Seller: {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
                    </span>
                  </div>
                  <div className="nft-actions">
                    {nft.seller.toLowerCase() === account.toLowerCase() ? (
                      <button 
                        className="unlist-button"
                        onClick={() => handleUnlistNFT(nft.tokenId)}
                      >
                        Unlist NFT
                      </button>
                    ) : (
                      <button 
                        className="buy-button"
                        onClick={() => handleBuyNFT(nft.tokenId, nft.price)}
                      >
                        Buy NFT
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  </div>
);
};

export default NFTMarketplacePage;
