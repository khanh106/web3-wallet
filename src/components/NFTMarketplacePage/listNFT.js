const listNFT = async (tokenId, price) => {
  try {
    if (!nftMarketplace || !kpayToken) {
      setError('Contracts not loaded');
      return;
    }

    // Convert price to wei
    const priceInWei = ethers.parseEther(price.toString());

    // Approve KPAY token spending
    const approveTx = await kpayToken.approve(
      NFT_MARKETPLACE_ADDRESS,
      priceInWei
    );
    await approveTx.wait();

    // List NFT on marketplace
    const listTx = await nftMarketplace.listItem(tokenId, priceInWei);
    await listTx.wait();

    // Reload NFTs after listing
    await loadNFTs(nftMarketplace);
    
    return true;
  } catch (error) {
    console.error("Error listing NFT:", error);
    setError('Error listing NFT. Please try again.');
    return false;
  }
};

export default listNFT;