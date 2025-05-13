import React from "react";
import { Link } from "react-router-dom";

function QuickActions({ handleClick, hoveredQuick, setHoveredQuick, cardStyle, quickActionHoverStyle }) {
  return (
    <section style={{ maxWidth: "1200px", width: "100%", padding: "1rem", margin: "2rem auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Quick Actions
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <Link
          to="/token-creation"
          style={hoveredQuick === 'create' ? { ...cardStyle, ...quickActionHoverStyle, textDecoration: "none", color: "#FFFFFF", transition: "all 0.2s" } : { ...cardStyle, textDecoration: "none", color: "#FFFFFF", transition: "all 0.2s" }}
          onClick={handleClick}
          onMouseEnter={() => setHoveredQuick('create')}
          onMouseLeave={() => setHoveredQuick(null)}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: "medium" }}>
            Create Token
          </span>
        </Link>
        <Link
          to="/nft-marketplace"
          style={hoveredQuick === 'nft' ? { ...cardStyle, ...quickActionHoverStyle, textDecoration: "none", color: "#FFFFFF", transition: "all 0.2s" } : { ...cardStyle, textDecoration: "none", color: "#FFFFFF", transition: "all 0.2s" }}
          onClick={handleClick}
          onMouseEnter={() => setHoveredQuick('nft')}
          onMouseLeave={() => setHoveredQuick(null)}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: "medium" }}>
            Buy NFT
          </span>
        </Link>
        <Link
          to="/dapps"
          style={hoveredQuick === 'dapps' ? { ...cardStyle, ...quickActionHoverStyle, textDecoration: "none", color: "#FFFFFF", transition: "all 0.2s" } : { ...cardStyle, textDecoration: "none", color: "#FFFFFF", transition: "all 0.2s" }}
          onClick={handleClick}
          onMouseEnter={() => setHoveredQuick('dapps')}
          onMouseLeave={() => setHoveredQuick(null)}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: "medium" }}>
            Access DApp
          </span>
        </Link>
      </div>
    </section>
  );
}

export default QuickActions; 