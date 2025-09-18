import React from 'react';
import { File, Users, Clock, Moon, Sun, Wallet, LogOut } from 'lucide-react';
import './Sidebar.css';

// Helper function to truncate address
const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const Sidebar = ({ 
  connectWallet, 
  disconnectWallet,
  account, 
  darkMode, 
  toggleDarkMode, 
  activeView, // Receive active view state
  setActiveView // Receive setter function
}) => {

  const navItems = [
    { id: 'my-files', label: 'My Files', icon: File },
    { id: 'shared', label: 'Shared', icon: Users },
    { id: 'access-log', label: 'Access Log', icon: Clock },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>DStorage</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li 
                key={item.id} 
                className={activeView === item.id ? 'active' : ''} 
                onClick={() => account && setActiveView(item.id)}
                style={{ cursor: account ? 'pointer' : 'not-allowed' }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        {!account ? (
          <button onClick={connectWallet} className="connect-wallet-button-sidebar">
            <Wallet size={20} />
            <span>Connect Wallet</span>
          </button>
        ) : (
          <div className="connection-status-box">
            <span className="connected-label">Connected Wallet</span>
            <span className="connected-address" title={account}>
              {truncateAddress(account)}
            </span>
            <button onClick={disconnectWallet} className="disconnect-link">
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
