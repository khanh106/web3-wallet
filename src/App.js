import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import TokenCreationPage from './pages/TokenCreationPage';
import NFTMarketplacePage from './pages/NFTMarketplacePage';
import CreateNFTPage from './pages/CreateNFTPage';
import PortfolioPage from './pages/PortfolioPage';
import DigitalAssetExchangePage from './pages/DigitalAssetExchangePage';
import AutomatedTokenPurchasePage from './pages/AutomatedTokenPurchasePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-token" element={<TokenCreationPage />} />
          <Route path="/nft-marketplace" element={<NFTMarketplacePage />} />
          <Route path="/create-nft" element={<CreateNFTPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/digital-asset-exchange" element={<DigitalAssetExchangePage />} />
          <Route path="/automated-token-purchase" element={<AutomatedTokenPurchasePage />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
