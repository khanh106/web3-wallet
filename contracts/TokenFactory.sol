// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Kpay.sol";

contract TokenFactory is Ownable {
    Kpay public kpayToken;
    uint256 public constant CREATION_FEE = 100 * 10**18; // 100 KPAY tokens
    
    // Danh sách tất cả các token đã tạo
    address[] public allTokens;
    
    // Mapping từ creator -> danh sách token đã tạo
    mapping(address => address[]) public userTokens;

    event TokenCreated(address indexed tokenAddress, string name, string symbol, uint256 initialSupply, address creator);

    constructor(address _kpayTokenAddress) Ownable(msg.sender) {
        require(_kpayTokenAddress != address(0), "Invalid KPAY token address");
        kpayToken = Kpay(_kpayTokenAddress);
    }

    function setKpayToken(address _kpayTokenAddress) external onlyOwner {
        require(_kpayTokenAddress != address(0), "Invalid KPAY token address");
        kpayToken = Kpay(_kpayTokenAddress);
    }

    function createToken(string memory name, string memory symbol, uint256 initialSupply) external {
        // Kiểm tra và chuyển phí KPAY
        require(kpayToken.transferFrom(msg.sender, address(this), CREATION_FEE), "Fee transfer failed");
        
        // Tạo token mới
        ERC20Token newToken = new ERC20Token(name, symbol, initialSupply, msg.sender);
        address tokenAddress = address(newToken);
        
        // Thêm vào danh sách quản lý
        allTokens.push(tokenAddress);
        userTokens[msg.sender].push(tokenAddress);
        
        emit TokenCreated(tokenAddress, name, symbol, initialSupply, msg.sender);
    }
    
    // ====================
    // CÁC HÀM TRUY VẤN
    // ====================
    
    // Lấy số lượng token đã tạo bởi 1 user
    function getUserTokenCount(address user) public view returns (uint256) {
        return userTokens[user].length;
    }
    
    // Lấy danh sách tất cả token đã tạo
    function getAllTokens() public view returns (address[] memory) {
        return allTokens;
    }
    
    // Lấy danh sách token của 1 user
    function getUserTokens(address user) public view returns (address[] memory) {
        return userTokens[user];
    }
    
    // Rút phí (chỉ owner)
    function withdrawFees() external onlyOwner {
        uint256 balance = kpayToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(kpayToken.transfer(owner(), balance), "Fee withdrawal failed");
    }
}

contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply, address creator) ERC20(name, symbol) {
        _mint(creator, initialSupply);
    }
}