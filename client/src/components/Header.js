import React from 'react';
import { Search } from 'lucide-react';
import './Header.css'; // We'll create this CSS file next

const Header = () => {
  return (
    <header className="header">
      <div className="search-bar">
        <Search size={20} color="#666" />
        <input type="text" placeholder="Search files..." />
      </div>
      {/* Add user profile/avatar if needed */}
    </header>
  );
};

export default Header; 