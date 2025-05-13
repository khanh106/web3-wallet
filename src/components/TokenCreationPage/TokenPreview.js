import React from 'react';
import './TokenPreview.css';

const TokenPreview = ({ tokenData }) => {
  const previewLogo = tokenData.logo 
    ? URL.createObjectURL(tokenData.logo)
    : '/default-token-logo.png';

  return (
    <div className="token-preview">
      <h2>Token Preview</h2>
      <div className="preview-card">
        <div className="preview-logo">
          <img src={previewLogo} alt="Token Logo" />
        </div>
        <div className="preview-details">
          <h3>{tokenData.name || 'Token Name'}</h3>
          <p className="symbol">{tokenData.symbol || 'SYMBOL'}</p>
          {tokenData.description && (
            <p className="description">{tokenData.description}</p>
          )}
          <div className="token-info">
            <div className="info-item">
              <span className="label">Total Supply:</span>
              <span className="value">
                {tokenData.totalSupply 
                  ? `${Number(tokenData.totalSupply).toLocaleString()} ${tokenData.symbol || 'tokens'}`
                  : 'Not set'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Decimals:</span>
              <span className="value">{tokenData.decimals || '18'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPreview; 