import React from 'react';
import './WalletInfo.css';

const WalletInfo = ({ account }) => {
  return (
    <div className="wallet-info">
      <h1>NFT Marketplace</h1>
      <div className="account-info">
        {account ? (
          <p>Connected Account: {account}</p>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </div>
    </div>
  );
};

export default WalletInfo; 