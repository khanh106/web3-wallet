import React from 'react';
import './CreateNFTForm.css';

const CreateNFTForm = ({ formData, handleInputChange, handleImageChange, createNFT, loading, error }) => {
  return (
    <div className="create-nft-form">
      <h2>Create New NFT</h2>
      <form onSubmit={createNFT}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price (KPAY)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.000001"
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create NFT'}
        </button>
      </form>
    </div>
  );
};

export default CreateNFTForm; 