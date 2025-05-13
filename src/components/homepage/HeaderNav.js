import React from "react";
import { Link } from "react-router-dom";

const navLinkHoverStyle = {
  color: "#FFD700",
  background: "rgba(255,255,255,0.07)",
  borderRadius: "0.5rem",
  padding: "0.3rem 0.7rem",
  transition: "all 0.2s"
};

function HeaderNav({
  account,
  isConnected,
  connectWallet,
  disconnectWallet,
  hoveredNav,
  setHoveredNav,
  connectWalletButtonStyle,
  disconnectWalletButtonStyle,
  walletContainerStyle,
  walletAddressStyle
}) {
  return (
    <header style={{
      backgroundColor: "#0F0F0F",
      position: "sticky",
      top: 0,
      zIndex: 50,
      width: "100%",
      margin: 0,
      padding: "1rem 0",
      borderBottom: "1px solid #333",
    }}>
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1rem",
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
      }}>
        <div style={{ height: "2rem" }}>
          <img src="/k.png" alt="Kpay DEX Logo" style={{ height: "100%" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link to="/" style={hoveredNav === 'home' ? { ...navLinkHoverStyle } : { color: "#FFFFFF", textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }} onMouseEnter={() => setHoveredNav('home')} onMouseLeave={() => setHoveredNav(null)}>Home</Link>
          <Link to="/trade" style={hoveredNav === 'trade' ? { ...navLinkHoverStyle } : { color: "#FFFFFF", textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }} onMouseEnter={() => setHoveredNav('trade')} onMouseLeave={() => setHoveredNav(null)}>Trade</Link>
          <Link to="/nft-marketplace" style={hoveredNav === 'nft' ? { ...navLinkHoverStyle } : { color: "#FFFFFF", textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }} onMouseEnter={() => setHoveredNav('nft')} onMouseLeave={() => setHoveredNav(null)}>NFT</Link>
          <Link to="/dapps" style={hoveredNav === 'dapps' ? { ...navLinkHoverStyle } : { color: "#FFFFFF", textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }} onMouseEnter={() => setHoveredNav('dapps')} onMouseLeave={() => setHoveredNav(null)}>DApps</Link>
          <Link to="/profile" style={hoveredNav === 'profile' ? { ...navLinkHoverStyle } : { color: "#FFFFFF", textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }} onMouseEnter={() => setHoveredNav('profile')} onMouseLeave={() => setHoveredNav(null)}>Profile</Link>
        </div>
        {isConnected ? (
          <div style={walletContainerStyle}>
            <div style={walletAddressStyle}>
              <span style={{ color: "#4CAF50" }}>●</span>
              Sepolia: {account.substring(0, 6)}...{account.substring(38)}
            </div>
            <button 
              style={disconnectWalletButtonStyle} 
              onClick={disconnectWallet}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button style={connectWalletButtonStyle} onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </nav>
    </header>
  );
}

export default HeaderNav; 