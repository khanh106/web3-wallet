// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable, Pausable {
    // Thay Counters.Counter bằng uint256
    uint256 private _tokenIdCounter;

    IERC20 public kpayToken;

    struct NFTListing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isListed;
    }

    mapping(uint256 => NFTListing) public nftListings;

    // Events
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event NFTListingCancelled(uint256 indexed tokenId, address indexed seller);
    event NFTPriceUpdated(uint256 indexed tokenId, address indexed seller, uint256 newPrice);

    constructor(IERC20 _kpayToken) ERC721("KpayNFT", "KNFT") Ownable(msg.sender) {
        require(address(_kpayToken) != address(0), "Invalid token address");
        kpayToken = _kpayToken;
        // Khởi tạo _tokenIdCounter (bắt đầu từ 0 hoặc 1 tùy yêu cầu)
        _tokenIdCounter = 0;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function createNFT(string memory tokenURI) external whenNotPaused returns (uint256) {
        require(bytes(tokenURI).length > 0, "Empty token URI");
        // Tăng _tokenIdCounter và lấy giá trị mới
        _tokenIdCounter += 1;
        uint256 newItemId = _tokenIdCounter;
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

    function listItem(uint256 tokenId, uint256 price) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(!nftListings[tokenId].isListed, "Already listed");
        require(price > 0, "Price must be > 0");

        nftListings[tokenId] = NFTListing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isListed: true
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    function updateListingPrice(uint256 tokenId, uint256 newPrice) external whenNotPaused {
        NFTListing storage listing = nftListings[tokenId];
        require(listing.isListed, "Not listed");
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(newPrice > 0, "Price must be > 0");

        listing.price = newPrice;
        emit NFTPriceUpdated(tokenId, msg.sender, newPrice);
    }

    function cancelListing(uint256 tokenId) external whenNotPaused {
        NFTListing storage listing = nftListings[tokenId];
        require(listing.isListed, "Not listed");
        require(ownerOf(tokenId) == msg.sender, "Not owner");

        delete nftListings[tokenId];
        emit NFTListingCancelled(tokenId, msg.sender);
    }

    function buyNFT(uint256 tokenId) external whenNotPaused {
        NFTListing storage listing = nftListings[tokenId];
        require(listing.isListed, "Not listed");
        require(
            kpayToken.allowance(msg.sender, address(this)) >= listing.price,
            "Insufficient allowance"
        );

        kpayToken.transferFrom(msg.sender, listing.seller, listing.price);
        _transfer(listing.seller, msg.sender, tokenId);
        
        emit NFTSold(tokenId, listing.seller, msg.sender, listing.price);
        delete nftListings[tokenId];
    }

    function withdrawKpay(uint256 amount) external onlyOwner {
        require(
            kpayToken.balanceOf(address(this)) >= amount,
            "Insufficient balance"
        );
        kpayToken.transfer(owner(), amount);
    }

    // Hàm để lấy giá trị hiện tại của _tokenIdCounter (tùy chọn)
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
}