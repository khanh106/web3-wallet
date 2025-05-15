// src/components/NFTMarketplacePage/ListNFTForm.js
import React, { useState } from 'react';

const ListNFTForm = ({ selectedNFT, onList }) => {
  const [price, setPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedNFT && price) {
      await onList(selectedNFT.tokenId, price);
      setPrice('');
    }
  };

  return (
    <div className="list-nft-form">
      <h3>List Your NFT</h3>
      {selectedNFT ? (
        <div className="selected-nft">
          <img 
            src={selectedNFT.tokenURI} 
            alt={`NFT #${selectedNFT.tokenId}`} 
            className="selected-nft-image"
          />
          <div className="selected-nft-info">
            <h4>Selected NFT #{selectedNFT.tokenId}</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Price (KPAY):</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.000001"
                  required
                />
              </div>
              <button type="submit" className="list-button">
                List NFT
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p>Please select an NFT from your collection to list</p>
      )}
    </div>
  );
};

export default ListNFTForm;