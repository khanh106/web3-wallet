import React from "react";

function TokenList({ tokens, isLoading, isConnected, hoveredToken, setHoveredToken, tokenCardStyle, tokenCardHoverStyle, tokenLogoStyle, tokenInfoStyle, tokenNameStyle, tokenBalanceStyle, tokenListStyle }) {
  return (
    <section style={{ maxWidth: "1200px", width: "100%", padding: "1rem", margin: "2rem auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Your Tokens
      </h2>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading tokens...
        </div>
      ) : tokens.length > 0 ? (
        <div style={tokenListStyle}>
          {tokens.map((token, idx) => (
            <div
              key={token.address}
              style={hoveredToken === idx ? tokenCardHoverStyle : tokenCardStyle}
              onMouseEnter={() => setHoveredToken(idx)}
              onMouseLeave={() => setHoveredToken(null)}
            >
              <div style={tokenLogoStyle}>
                {token.symbol === "KPAY" ? (
                  <img
                    src="/img/logo_kpay.png"
                    alt="KPAY"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : token.logo ? (
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  <span style={{ color: "#FFFFFF", fontSize: "1.2rem" }}>
                    {token.symbol.charAt(0)}
                  </span>
                )}
              </div>
              <div style={tokenInfoStyle}>
                <div style={tokenNameStyle}>{token.name}</div>
                <div style={tokenBalanceStyle}>
                  {token.balance} {token.symbol}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "2rem", color: "#888888" }}>
          {isConnected ? "No tokens found in your wallet" : "Connect your wallet to view tokens"}
        </div>
      )}
    </section>
  );
}

export default TokenList; 