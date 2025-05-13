import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import "./HomePage.css";

const HomePage = () => {
  const [account, setAccount] = useState("");
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      toast.success("Wallet connected!");
    } catch (err) {
      toast.error("Failed to connect wallet");
    }
  };

  return (
    <div className="home-container">
      <HeroSection
        account={account}
        onConnect={connectWallet}
        onCreateToken={() => navigate("/create-token")}
        onViewTokens={() => navigate("/tokens")}
      />
      <FeaturesSection />
      <HowItWorksSection />
    </div>
  );
};

export default HomePage; 