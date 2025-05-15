import React, { useState } from 'react';
import { ethers } from 'ethers';
import NFTMarketplaceABI from '../../abi/NFTMarketplace.json';
import KpayABI from '../../abi/Kpay.json';
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
  setLoading(true);
  setError('');
  try {
    if (!formData.image) {
      throw new Error('Please select an image');
    }

    // Upload image to IPFS
    const imageFormData = new FormData();
    imageFormData.append('file', formData.image);

    const imageUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.REACT_APP_PINATA_API_KEY}`
      },
      body: imageFormData
    });

    if (!imageUploadResponse.ok) {
      throw new Error('Failed to upload image to IPFS');
    }

    const imageData = await imageUploadResponse.json();
    const imageURI = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

    // Upload metadata to IPFS
    const metadata = {
      name: formData.name,
      description: formData.description,
      image: imageURI
    };

    const metadataUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.REACT_APP_PINATA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!metadataUploadResponse.ok) {
      throw new Error('Failed to upload metadata to IPFS');
    }

    const metadataData = await metadataUploadResponse.json();
    const metadataURI = `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`;

    // Connect to contracts
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const nftMarketplaceContract = new ethers.Contract(
      NFT_MARKETPLACE_ADDRESS,
      NFTMarketplaceABI,
      signer
    );

    // Create the NFT
    const create = await nftMarketplaceContract.createNFT(metadataURI, { gasLimit: 500000 });
    const createReceipt = await create.wait();

    // Lấy tokenId từ event
    const event = createReceipt.logs.find(
      log => log.topics[0] === '0xf8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7'
    );

    if (!event) {
      throw new Error('Could not find tokenId in transaction receipt');
    }

    const tokenId = parseInt(event.data, 16);
    console.log('Created NFT with tokenId:', tokenId);

    // Reset form
    setFormData({
      name: '',
      description: '',
      image: null
    });
    
    // Hiển thị thông báo thành công
    alert(`NFT created successfully with tokenId: ${tokenId}`);
    
    // Redirect to marketplace page after successful creation
    window.location.href = './NFTMarketplacePage';

  } catch (error) {
    console.error('Error creating NFT:', error);
    setError(error.message || 'Error creating NFT');
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img=new window.Image();
    const objectUrl=URL.createObjectURL(file);

    img.onload=()=>{
      if(img.width>200 || img.height>200){
        setError("Image must be less than 200x200px");
        setFormData({...formData, image:null});
      }else{
        setError("");
        setFormData({...formData, image:file});
      }
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror=()=>{
      setError("Invalid image format");
      setFormData({...formData, image:null});
      URL.revokeObjectURL(objectUrl);
    };
    img.src=objectUrl;
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
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
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
