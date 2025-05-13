import React from 'react';
import './TokenForm.css';

const TokenForm = ({
  tokenData,
  handleInputChange,
  handleLogoChange,
  handleSubmit,
  isLoading,
  currentStep,
  nextStep,
  prevStep
}) => {
  const renderStep1 = () => (
    <div className="form-step">
      <h2>Basic Information</h2>
      <div className="form-group">
        <label htmlFor="name">Token Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={tokenData.name}
          onChange={handleInputChange}
          placeholder="e.g., My Awesome Token"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="symbol">Token Symbol</label>
        <input
          type="text"
          id="symbol"
          name="symbol"
          value={tokenData.symbol}
          onChange={handleInputChange}
          placeholder="e.g., MAT"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={tokenData.description}
          onChange={handleInputChange}
          placeholder="Describe your token..."
          rows="4"
        />
      </div>
      <button type="button" className="next-button" onClick={nextStep}>
        Next
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h2>Token Details</h2>
      <div className="form-group">
        <label htmlFor="totalSupply">Total Supply</label>
        <input
          type="number"
          id="totalSupply"
          name="totalSupply"
          value={tokenData.totalSupply}
          onChange={handleInputChange}
          placeholder="e.g., 1000000"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="decimals">Decimals</label>
        <input
          type="number"
          id="decimals"
          name="decimals"
          value={tokenData.decimals}
          onChange={handleInputChange}
          min="0"
          max="18"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="logo">Token Logo</label>
        <input
          type="file"
          id="logo"
          name="logo"
          onChange={handleLogoChange}
          accept="image/*"
        />
      </div>
      <div className="button-group">
        <button type="button" className="prev-button" onClick={prevStep}>
          Previous
        </button>
        <button type="button" className="next-button" onClick={nextStep}>
          Next
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h2>Review & Create</h2>
      <div className="review-section">
        <h3>Please review your token details:</h3>
        <div className="review-item">
          <strong>Name:</strong> {tokenData.name}
        </div>
        <div className="review-item">
          <strong>Symbol:</strong> {tokenData.symbol}
        </div>
        <div className="review-item">
          <strong>Total Supply:</strong> {tokenData.totalSupply}
        </div>
        <div className="review-item">
          <strong>Decimals:</strong> {tokenData.decimals}
        </div>
        {tokenData.description && (
          <div className="review-item">
            <strong>Description:</strong> {tokenData.description}
          </div>
        )}
      </div>
      <div className="button-group">
        <button type="button" className="prev-button" onClick={prevStep}>
          Previous
        </button>
        <button
          type="submit"
          className="submit-button"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Token'}
        </button>
      </div>
    </div>
  );

  return (
    <form className="token-form">
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </form>
  );
};

export default TokenForm; 