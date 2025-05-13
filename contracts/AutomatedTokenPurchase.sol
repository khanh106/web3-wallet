// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AutomatedTokenPurchase is Ownable {
    IERC20 public kpayToken;

    struct PurchaseOrder {
        address tokenAddress;
        uint256 purchaseInterval;
        uint256 kpayAmount;
    }

    // Thêm event
    event PurchaseExecuted(address indexed buyer, uint256 amount);
    event OrderCreated(address indexed buyer, address token, uint256 interval, uint256 amount);
    event OrderCancelled(address indexed buyer);

    mapping(address => PurchaseOrder) public purchaseOrders;

    constructor(IERC20 _kpayToken) Ownable(msg.sender) {
        kpayToken = _kpayToken;
    }

    function createPurchaseOrder(address _tokenAddress, uint256 _purchaseInterval, uint256 _kpayAmount) external onlyOwner {
        require(_purchaseInterval > 0, "Purchase interval must be greater than 0");
        require(_kpayAmount > 0, "Kpay amount must be greater than 0");

        purchaseOrders[msg.sender] = PurchaseOrder(_tokenAddress, _purchaseInterval, _kpayAmount);
        emit OrderCreated(msg.sender, _tokenAddress, _purchaseInterval, _kpayAmount);
    }

    function cancelPurchaseOrder() external onlyOwner {
        require(purchaseOrders[msg.sender].tokenAddress != address(0), "No active order");
        delete purchaseOrders[msg.sender];
        emit OrderCancelled(msg.sender);
    }

    function executePurchase() external {
        PurchaseOrder storage order = purchaseOrders[msg.sender];
        require(order.tokenAddress != address(0), "No purchase order found");
        require(kpayToken.balanceOf(msg.sender) >= order.kpayAmount, "Insufficient KPAY balance");

        // Thực hiện chuyển token
        bool success = kpayToken.transferFrom(msg.sender, address(this), order.kpayAmount);
        require(success, "Token transfer failed");

        // Thêm logic swap/mua token ở đây
        // Ví dụ: swap KPAY -> order.tokenAddress

        emit PurchaseExecuted(msg.sender, order.kpayAmount);
    }

    // Thêm hàm emergency withdraw nếu cần
    function withdrawTokens(IERC20 token, uint256 amount) external onlyOwner {
        token.transfer(owner(), amount);
    }
}