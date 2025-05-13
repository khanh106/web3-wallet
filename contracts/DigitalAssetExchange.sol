// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DigitalAssetExchange {
    IERC20 public kpayToken;
    address public owner;

    struct AssetListing {
        address seller;
        string assetLink;
        uint256 price;
        bool isListed;
    }

    mapping(uint256 => AssetListing) public assetListings;
    uint256 public listingCount;

    constructor(IERC20 _kpayToken) {
        kpayToken = _kpayToken;
        owner = msg.sender;
    }

    function listItem(string memory assetLink, uint256 price) external {
        listingCount++;
        assetListings[listingCount] = AssetListing(msg.sender, assetLink, price, true);
    }

    function buyAsset(uint256 listingId) external {
        AssetListing storage listing = assetListings[listingId];
        require(listing.isListed, "Asset is not listed");

        kpayToken.transferFrom(msg.sender, listing.seller, listing.price);
        listing.isListed = false;
    }

    function withdrawKpay(uint256 amount) external {
        require(msg.sender == owner, "Only owner can withdraw");
        kpayToken.transfer(owner, amount);
    }
}
