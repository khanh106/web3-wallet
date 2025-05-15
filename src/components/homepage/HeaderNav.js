import React from "react";
import { Link } from "react-router-dom";
import "./HeaderNav.css";

const navLinkHoverStyle = {
  color: "#FFD700",
  background: "rgba(58, 58, 57, 0.94)",
  borderRadius: "0.5rem",
  padding: "0.3rem 0.7rem",
  transition: "all 0.2s",
  textDecoration: "none",
};

function HeaderNav({
  account,
  isConnected,
  connectWallet,
  disconnectWallet,
  hoveredNav,
  setHoveredNav,
  // connectWalletButtonStyle,
  // disconnectWalletButtonStyle,
  // walletContainerStyle,
  // walletAddressStyle
}) {
  return (
    <header className="header-nav">
      <nav className="header-nav__container">
        <div className="header-nav__logo">
         <Link to="/">
         <img src="img/BNB.png" alt="Kpay DEX Logo"  />
         </Link>
        </div>
        <div className="header-nav__links">
          <Link to="/trade" style={hoveredNav === 'trade' ? { ...navLinkHoverStyle } : { color: "#FFFFFF", textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }} onMouseEnter={() => setHoveredNav('trade')} onMouseLeave={() => setHoveredNav(null)}>Trade</Link>
          <Link to="/nft-marketplace" style={hoveredNav === 'nft' ? { ...navLinkHoverStyle } : { color: "#FFFFFF", textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }} onMouseEnter={() => setHoveredNav('nft')} onMouseLeave={() => setHoveredNav(null)}>NFT</Link>
          <Link to="/dapps" style={hoveredNav === 'dapps' ? { ...navLinkHoverStyle } : { color: "#FFFFFF", textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }} onMouseEnter={() => setHoveredNav('dapps')} onMouseLeave={() => setHoveredNav(null)}>DApps</Link>
          <Link to="/profile" style={hoveredNav === 'profile' ? { ...navLinkHoverStyle } : { color: "#FFFFFF", textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }} onMouseEnter={() => setHoveredNav('profile')} onMouseLeave={() => setHoveredNav(null)}>Profile</Link>
        </div>
        {isConnected ? (
          <div className="header-nav__wallet">
            <div >
              <span style={{ color: "#4CAF50" }}>●</span>
              <span style={{ color: "#fff" }}>Sepolia: {account.substring(0, 6)}...{account.substring(38)}</span>
            </div>
            <button className="header-nav__wallet header-nav__wallet-button"
              onClick={disconnectWallet}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button className="header-nav__wallet-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        
      </nav>
    </header>
  );
}

export default HeaderNav; 