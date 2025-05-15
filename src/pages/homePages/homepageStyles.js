export const styles = {
  container: {
    fontFamily: "sans-serif",
    backgroundColor: "#0F0F0F",
    color: "#FFFFFF",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
    padding: 0,
    overflowX: "hidden"
  },
  main: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  heroStyle: {
    background: "linear-gradient(to bottom, #1A73E8, #0F0F0F)",
    padding: "5rem 1rem",
    width: "100%",
    textAlign: "center",
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  heroTextStyle: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "2rem",
    color: "#fff",
    textShadow: "2px 2px 4px #000000"
  },
  heroButtonGroupStyle: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem"
  },
  heroLaunchButtonStyle: {
    borderRadius: "2rem",
    background: "linear-gradient(to right, #007BFF, #6C757D)",
    padding: "0.75rem 2rem",
    color: "#FFFFFF",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer"
  },
  heroLearnButtonStyle: {
    borderRadius: "2rem",
    border: "1px solid #FFFFFF",
    padding: "0.75rem 2rem",
    color: "#FFFFFF",
    fontWeight: "bold",
    backgroundColor: "transparent",
    cursor: "pointer"
  },
  connectWalletButtonStyle: {
    borderRadius: "2rem",
    background: "linear-gradient(to right, #007BFF, #6C757D)",
    padding: "0.5rem 1rem",
    color: "#FFFFFF",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    marginLeft: "1rem",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  },
  disconnectWalletButtonStyle: {
    borderRadius: "2rem",
    background: "linear-gradient(to right, #DC3545, #6C757D)",
    padding: "0.5rem 1.2rem",
    color: "#FFFFFF",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    marginLeft: "1rem",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  },
  walletAddressStyle: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "0.5rem 1rem",
    borderRadius: "2rem",
    color: "#FFFFFF",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  walletContainerStyle: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: "0.5rem",
    borderRadius: "2rem",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  tokenListStyle: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1rem",
    width: "100%",
    marginTop: "1rem"
  },
  tokenCardStyle: {
    backgroundColor: "#1A1A1A",
    borderRadius: "0.5rem",
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "transform 0.2s ease"
  },
  tokenCardHoverStyle: {
    backgroundColor: "#1A1A1A",
    borderRadius: "0.5rem",
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    border: "1.5px solid #FFD700",
    boxShadow: "0 6px 24px 0 rgba(255, 215, 0, 0.18)",
    background: "rgba(255,255,255,0.04)",
    transform: "scale(1.04)",
    transition: "all 0.2s"
  },
  tokenLogoStyle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#2A2A2A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  tokenInfoStyle: { flex: 1 },
  tokenNameStyle: { fontSize: "1rem", fontWeight: "bold", marginBottom: "0.25rem" },
  tokenBalanceStyle: { fontSize: "0.9rem", color: "#888888" },
  cardStyle: { backgroundColor: "#1A1A1A", borderRadius: "0.5rem", padding: "1.5rem", marginBottom: "1rem" },
  quickActionHoverStyle: { backgroundColor: "#232323", transform: "scale(1.06)", boxShadow: "0 6px 24px 0 rgba(0, 123, 255, 0.18)", border: "1.5px solid #007bff", cursor: "pointer", transition: "all 0.2s" }
}; 