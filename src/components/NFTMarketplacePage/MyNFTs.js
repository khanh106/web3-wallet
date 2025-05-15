// src/components/NFTMarketplacePage/MyNFTs.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './NFTList.css';
import './nft.css';

const MyNFTs = ({ nftMarketplace, account, onSelectNFT }) => {
  const [myNFTs, setMyNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nftMarketplace && account) {
      loadMyNFTs();
    }
  }, [nftMarketplace, account]);

  const loadMyNFTs = async () => {
    try {
      setLoading(true);
      const totalSupply = await nftMarketplace.getCurrentTokenId();
      const nftList = [];

      for (let i = 1; i <= totalSupply; i++) {
        try {
          const owner = await nftMarketplace.ownerOf(i);
          if (owner.toLowerCase() === account.toLowerCase()) {
            const tokenURI = await nftMarketplace.tokenURI(i);
            const listing = await nftMarketplace.nftListings(i);
            
            let metadata = null;
            let imageUrl = tokenURI;

            // Fetch metadata nếu tokenURI là URL
            if (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs')) {
              try {
                const response = await fetch(tokenURI);
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                metadata = await response.json();
                imageUrl = metadata.image || tokenURI;
              } catch (error) {
                console.warn(`Error fetching metadata for token ${i}:`, error);
                imageUrl = tokenURI;
              }
            }

            nftList.push({
              tokenId: i,
              tokenURI: imageUrl,
              name: metadata?.name || `NFT #${i}`,
              description: metadata?.description || "No description",
              isListed: listing.isListed
            });
          }
        } catch (error) {
          console.warn(`Error loading NFT ${i}:`, error);
          continue;
        }
      }

      setMyNFTs(nftList);
      setLoading(false);
    } catch (error) {
      console.error("Error loading my NFTs:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your NFTs...</div>;
  }

  return (
    <div className="my-nfts">
      <h3>Your NFTs</h3>
      <div className="my-nfts-grid">
        {myNFTs.length === 0 ? (
          <p>You don't own any NFTs yet.</p>
        ) : (
          myNFTs.map(nft => (
            <div 
              key={nft.tokenId} 
              className={`nft-card ${nft.isListed ? 'listed' : ''}`}
              onClick={() => !nft.isListed && onSelectNFT(nft)}
            >
              <div className="nft-image-container">
                <img 
                  src={nft.tokenURI} 
                  alt={nft.name || `NFT #${nft.tokenId}`} 
                  className="nft-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/path/to/fallback-image.png'; // Thay thế bằng ảnh mặc định của bạn
                  }}
                />
              </div>
              <div className="nft-info">
                <h4>{nft.name || `NFT #${nft.tokenId}`}</h4>
                <p className="nft-description">{nft.description}</p>
                {nft.isListed ? (
                  <span className="listed-badge">Already Listed</span>
                ) : (
                  <button className="select-button">Select to List</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyNFTs;