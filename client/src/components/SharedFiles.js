import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Download } from 'lucide-react';
import "./Display.css";

const SharedFiles = ({ contract, account }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSharedFiles = async () => {
      if (!contract || !account) {
        console.log("Contract or account not available");
        return;
      }

      setLoading(true);
      setError(null);
      setData([]);

      try {
        console.log("Fetching shared files...");
        const sharedFiles = [];
        
        // Get all addresses that have shared files
        const allAddresses = await contract.shareAccess();
        console.log("All addresses with access:", allAddresses);

        // For each address, check if they have shared with current account
        for (const access of allAddresses) {
          if (access.access) { // If access is granted
            try {
              // Check if the current user has access to this address's files
              const hasAccess = await contract.ownership(access.user, account);
              console.log(`Access check for ${access.user}:`, hasAccess);
              
              if (hasAccess) {
                const ownerFiles = await contract.display(access.user);
                console.log(`Files from ${access.user}:`, ownerFiles);
                sharedFiles.push(...ownerFiles);
              }
            } catch (err) {
              console.error(`Error checking access for ${access.user}:`, err);
            }
          }
        }

        console.log("Final shared files array:", sharedFiles);

        if (!sharedFiles || sharedFiles.length === 0) {
          console.log("No shared files found");
          setData([]);
          return;
        }

        const fileItems = sharedFiles.map((itemUrl, i) => {
          const isValidUrl = typeof itemUrl === 'string' && itemUrl.startsWith('http');
          
          if (!isValidUrl) {
            console.warn(`Invalid URL string found at index ${i}:`, itemUrl);
            return null;
          }

          return (
            <div className="file-item" key={i}>
              <div className="file-preview">
                <img
                  src={itemUrl} 
                  alt={`Preview ${i + 1}`}
                  className="file-image"
                  onError={(e) => {
                    console.error("Error loading image preview:", itemUrl);
                    e.target.style.display = 'none';
                    const previewDiv = e.target.closest('.file-preview');
                    if (previewDiv && !previewDiv.querySelector('.fallback-text')) {
                      previewDiv.innerHTML = '<span class="fallback-text">Preview N/A</span>';
                    }
                  }}
                />
              </div>
              <div className="file-actions">
                <a 
                  href={itemUrl} 
                  download
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-button download-button-item"
                  title="Download File"
                >
                  <Download size={18} />
                </a>
              </div>
            </div>
          );
        }).filter(Boolean);

        setData(fileItems);
      } catch (displayError) {
        console.error("Error in shared files fetch:", displayError);
        if (displayError.message?.includes("You don\'t have access")) {
          setError("Access Denied: You don\'t have permission to view these files.");
        } else {
          setError("Error fetching shared files. Please check console or try again.");
        }
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    getSharedFiles();
  }, [contract, account]);

  return (
    <div className="display-section">
      {!loading && !error && <h3>Shared with Me</h3>}
      
      {loading && (
        <div className="loading-indicator">
          <Loader2 className="icon-spin" size={24} />
          <p>Loading shared files...</p>
        </div>
      )}
      {error && (
        <div className="error-message">
          <AlertCircle size={20} style={{ marginRight: '8px' }} />
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <p className="no-files-message">No files shared with you yet.</p>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="file-grid">{data}</div>
      )}
    </div>
  );
};

export default SharedFiles; 