import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import HeaderNav from "../components/homepage/HeaderNav";
import KpayBalanceCard from "../components/homepage/KpayBalanceCard";
import TokenList from "../components/homepage/TokenList";
import QuickActions from "../components/homepage/QuickActions";
import { styles } from "./homepageStyles";
import "./HomePage.css";

// Import ABI và địa chỉ contract
import KPAY_ABI from "../abi/Kpay.json";
import TOKEN_FACTORY_ABI from "../abi/TokenFactory.json";

// ERC20 ABI cơ bản để đọc thông tin token
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

// Danh sách các token ERC20 phổ biến trên Sepolia (bạn có thể thêm vào đây)
const ERC20_TOKENS_SEPOLIA = [
  {
    address: "0xa53bc774ED9Ddcc2996c63603E56c8EC11FE665B", // KPAY
    symbol: "KPAY"
  },
  // Thêm các token ERC20 khác trên Sepolia nếu muốn
  // Ví dụ:
  // { address: "0x...", symbol: "USDT" },
  // { address: "0x...", symbol: "DAI" },
];

// Thay thế bằng địa chỉ thực tế của contract
const KPAY_ADDRESS = '0xa53bc774ED9Ddcc2996c63603E56c8EC11FE665B';
const TOKEN_FACTORY_ADDRESS = '0x421f76C7Dc399a22138277fe8d842003b397F5B0';

const HomePage = () => {
  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredQuick, setHoveredQuick] = useState(null);
  const [hoveredToken, setHoveredToken] = useState(null);
  const [kpayBalance, setKpayBalance] = useState("0");
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!", { duration: 3000 });
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setIsConnected(true);
      toast.success("Wallet connected!", { duration: 3000 });
    } catch (err) {
      toast.error("Failed to connect wallet", { duration: 3000 });
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setIsConnected(false);
    setKpayBalance("0");
    setTokens([]);
    toast.success("Wallet disconnected", { duration: 3000 });
  };

  const fetchKpayBalance = async () => {
    if (!isConnected) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const kpayContract = new ethers.Contract(KPAY_ADDRESS, KPAY_ABI.abi, provider);
      const balance = await kpayContract.balanceOf(account);
      setKpayBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching KPAY balance:', error);
    }
  };

  const fetchUserTokens = async () => {
    if (!isConnected) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenDetails = await Promise.all(
        ERC20_TOKENS_SEPOLIA.map(async (token) => {
          try {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
            const [name, symbol, balance, decimals] = await Promise.all([
              tokenContract.name(),
              tokenContract.symbol(),
              tokenContract.balanceOf(account),
              tokenContract.decimals()
            ]);
            const formattedBalance = ethers.formatUnits(balance, decimals);
            if (Number(formattedBalance) > 0) {
              return {
                address: token.address,
                name,
                symbol,
                balance: formattedBalance,
                decimals
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching token ${token.address}:`, error);
            return null;
          }
        })
      );
      const validTokens = tokenDetails.filter(token => token !== null);
      setTokens(validTokens);
    } catch (error) {
      console.error('Error fetching user tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchKpayBalance();
      fetchUserTokens();
    }
  }, [isConnected, account]);

  return (
    <div style={styles.container}>
      <HeaderNav
        account={account}
        isConnected={isConnected}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        hoveredNav={hoveredNav}
        setHoveredNav={setHoveredNav}
        connectWalletButtonStyle={styles.connectWalletButtonStyle}
        disconnectWalletButtonStyle={styles.disconnectWalletButtonStyle}
        walletContainerStyle={styles.walletContainerStyle}
        walletAddressStyle={styles.walletAddressStyle}
      />
      <main style={styles.main}>
        {/* Hero Section */}
        <section style={styles.heroStyle}>
          <h1 style={styles.heroTextStyle}>Welcome to KPAY DEX</h1>
          <p style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "2rem" }}>
            Create, trade, and manage your tokens with ease
          </p>
          <div style={styles.heroButtonGroupStyle}>
            <button
              style={styles.heroLaunchButtonStyle}
              onClick={() => navigate("/create-token")}
            >
              Create Token
            </button>
            <button
              style={styles.heroLearnButtonStyle}
              onClick={() => navigate("/tokens")}
            >
              View Tokens
            </button>
          </div>
        </section>

        {/* Portfolio Section - Only show when wallet is connected */}
        {isConnected && (
          <section style={{ padding: "2rem 1rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>
              Your Portfolio
            </h2>
            <KpayBalanceCard
              tokenName="KPAY"
              tokenSymbol="KPAY"
              kpayBalance={kpayBalance}
            />
            <TokenList
              tokens={tokens}
              isLoading={isLoading}
              isConnected={isConnected}
              hoveredToken={hoveredToken}
              setHoveredToken={setHoveredToken}
              tokenCardStyle={styles.tokenCardStyle}
              tokenCardHoverStyle={styles.tokenCardHoverStyle}
              tokenLogoStyle={styles.tokenLogoStyle}
              tokenInfoStyle={styles.tokenInfoStyle}
              tokenNameStyle={styles.tokenNameStyle}
              tokenBalanceStyle={styles.tokenBalanceStyle}
              tokenListStyle={styles.tokenListStyle}
            />
          </section>
        )}

        {/* Features Section */}
        <section style={{ padding: "4rem 1rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "3rem" }}>
            Key Features
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            <div style={styles.cardStyle}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Token Creation</h3>
              <p style={{ color: "#888" }}>Create your own tokens with just a few clicks. Set name, symbol, and supply.</p>
            </div>
            <div style={styles.cardStyle}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Token Trading</h3>
              <p style={{ color: "#888" }}>Trade tokens securely on our decentralized exchange platform.</p>
            </div>
            <div style={styles.cardStyle}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Portfolio Management</h3>
              <p style={{ color: "#888" }}>Track and manage all your tokens in one place.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section style={{ padding: "4rem 1rem", width: "100%", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#1A1A1A" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "3rem" }}>
            How It Works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>1</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Connect Wallet</h3>
              <p style={{ color: "#888" }}>Connect your MetaMask wallet to get started</p>
            </div>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>2</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Create Token</h3>
              <p style={{ color: "#888" }}>Fill in token details and deploy your token</p>
            </div>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>3</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Start Trading</h3>
              <p style={{ color: "#888" }}>Trade your tokens on our DEX platform</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <QuickActions
          handleClick={() => {}}
          hoveredQuick={hoveredQuick}
          setHoveredQuick={setHoveredQuick}
          cardStyle={styles.cardStyle}
          quickActionHoverStyle={styles.quickActionHoverStyle}
        />
      </main>
    </div>
  );
};

export default HomePage;