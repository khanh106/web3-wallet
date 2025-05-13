import React, { useState } from 'react';
import { ethers } from 'ethers';
import NFTMarketplaceABI from '../abi/NFTMarketplace.json';
import KpayABI from '../abi/Kpay.json';
import './CreateNFTPage.css';

const CreateNFTPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Contract addresses
  const NFT_MARKETPLACE_ADDRESS = "0x874969a25a88b592A66D3811b2FeAE7BC851c687";
  const KPAY_TOKEN_ADDRESS = "0xa53bc774ED9Ddcc2996c63603E56c8EC11FE665B";

  const createNFT = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (formData.image) {
        // Create metadata
        const metadata = {
          name: formData.name,
          description: formData.description,
          image: formData.image
        };

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

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

        const priceInWei = ethers.parseEther(formData.price);

        // Approve the marketplace to spend KPAY tokens
        const approval = await kpayTokenContract.approve(NFT_MARKETPLACE_ADDRESS, priceInWei, { gasLimit: 500000 });
        await approval.wait();

        // Create the NFT
        const create = await nftMarketplaceContract.createNFT(metadata.image, { gasLimit: 500000 });
        const createReceipt = await create.wait();
        const tokenId = createReceipt;

        // List the NFT
        await nftMarketplaceContract.listItem(tokenId, priceInWei, { gasLimit: 500000 });

        // List the NFT
        await nftMarketplaceContract.listItem(tokenId, priceInWei, { gasLimit: 500000 });

        // List the NFT
        const list = await nftMarketplaceContract.listItem(tokenId, priceInWei, { gasLimit: 500000 });
        await list.wait();

        setFormData({
          name: '',
          description: '',
          image: null,
          price: ''
        });
        
        // Redirect to marketplace page after successful creation
        window.location.href = '/marketplace';
      } else {
        setError('Please select an image');
      }
    } catch (error) {
      console.error(error);
      setError('Error creating NFT');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  return (
    <div className="create-nft-page">
      <div className="container">
        <h1>Create New NFT</h1>
        <form onSubmit={createNFT} className="create-nft-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Price (KPAY):</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create NFT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateNFTPage;
