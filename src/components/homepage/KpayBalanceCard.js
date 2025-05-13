import React from "react";

function KpayBalanceCard({ tokenName, tokenSymbol, kpayBalance }) {
  const cardStyle = {
    backgroundColor: "#1A1A1A",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    marginBottom: "1rem",
  };
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
        <img
          src="/img/logo_kpay.png"
          alt="Kpay Logo"
          style={{
            height: "2.2rem",
            width: "2.2rem",
            borderRadius: "50%",
            background: "#fff",
            border: "2px solid #FFD700",
            objectFit: "cover"
          }}
        />
        <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          {tokenName} ({tokenSymbol}) Balance
        </span>
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
          {kpayBalance} {tokenSymbol}
        </p>
        <p style={{ color: "#888888" }}>$0 Portfolio Value</p>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Deposit
        </button>
        <button
          style={{
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

export default KpayBalanceCard; 