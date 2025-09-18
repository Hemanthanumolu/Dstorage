import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import SharedFiles from "./components/SharedFiles";
import Modal from "./components/Modal";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AccessLog from "./components/AccessLog";
import { Wallet, File, Users, Clock, Moon, Sun, Loader2, AlertCircle } from 'lucide-react';
import "./App.css";
import ChatbotWidget from "./components/ChatbotWidget";

// Log the imported ABI structure immediately after import
console.log("Imported Upload ABI:", Upload.abi);

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('my-files');

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    if (provider) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      try {
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        console.log("Connecting to contract at address:", contractAddress);

        // Log the ABI *again* right before using it
        console.log("Using ABI to create contract instance:", Upload.abi);
        
        // Find the 'add' function definition in the ABI for verification
        const addFunctionAbi = Upload.abi.find(item => item.type === 'function' && item.name === 'add');
        console.log("Found 'add' function in ABI:", addFunctionAbi);

        try {
          const contractInstance = new ethers.Contract(
            contractAddress,
            Upload.abi,
            signer
          );
          console.log("Contract instance created successfully");
          setContract(contractInstance);
          setProvider(provider);
        } catch (contractError) {
          console.error("Error creating contract instance:", contractError);
          alert("Failed to connect to the contract. Please check the contract address and try again.");
        }
      } catch (err) {
        console.error("User rejected connection or Metamask error:", err);
        alert("Failed to connect wallet. Please ensure Metamask is installed and unlocked.");
      }
    } else {
      console.error("Metamask is not installed");
      alert("Metamask is not installed. Please install Metamask extension.");
    }
  };

  // Function to disconnect wallet
  const disconnectWallet = () => {
    console.log("Disconnecting wallet...");
    setAccount("");
    setProvider(null);
    setContract(null);
    setActiveView('my-files'); 
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const renderContent = () => {
    if (!account) {
      return (
        <div className="connect-wallet-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to upload and manage files</p>
          <button onClick={connectWallet} className="connect-wallet-button">
            <Wallet size={20} style={{ marginRight: '8px' }} /> Connect Wallet
          </button>
        </div>
      );
    }

    switch (activeView) {
      case 'my-files':
        return (
          <>
            {modalOpen && (
              <Modal setModalOpen={setModalOpen} contract={contract}></Modal>
            )}
            <p className="account-info">
              Account : {account}
            </p>
            <FileUpload
              account={account}
              provider={provider}
              contract={contract}
            />
            <Display 
              contract={contract} 
              account={account} 
              setModalOpen={setModalOpen} 
            />
          </>
        );
      case 'shared':
        return (
          <>
            <p className="account-info">
              Account : {account}
            </p>
            <SharedFiles 
              contract={contract}
              account={account}
            />
          </>
        );
      case 'access-log':
        return (
          <>
            <p className="account-info">
              Account : {account}
            </p>
            <AccessLog 
              contract={contract}
              account={account}
            />
          </>
        );
      default:
        return <div>Select a view from the sidebar.</div>;
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        account={account}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <div className="main-content">
        <Header />
        <div className="content-area">
          {renderContent()}
        </div>
      </div>
      <ChatbotWidget account={account} />
    </div>
  );
}

export default App;
