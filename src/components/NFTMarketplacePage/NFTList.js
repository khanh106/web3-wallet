import React from 'react';
import './NFTList.css';

const NFTList = ({ nfts, loading }) => {
  if (loading) {
    return <div className="loading">Loading NFTs...</div>;
  }

  if (nfts.length === 0) {
    return <div className="no-nfts">No NFTs available</div>;
  }

  return (
    <div className="nft-list">
      <h2>Available NFTs</h2>
      <div className="nft-grid">
        {nfts.map((nft) => (
          <div key={nft.tokenId} className="nft-card">
            <img src={nft.tokenURI} alt={`NFT #${nft.tokenId}`} className="nft-image" />
            <div className="nft-info">
              <p>Token ID: {nft.tokenId}</p>
              <p>Seller: {nft.seller}</p>
              <p className="price">Price: {nft.price} KPAY</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTList; 