import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Download, Share2 } from 'lucide-react'; // Icons for loading/error
import "./Display.css";

const Display = ({ contract, account, setModalOpen }) => {
  const [data, setData] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      if (!contract || !account) {
        console.log("Contract or account not available");
        return;
      }

      setLoading(true);
      setError(null);
      setData([]);

      try {
        console.log("Starting file fetch process...");
        console.log("Account:", account);
        
        // Fetch files owned by the current account
        const dataArray = await contract.display(account);
        console.log("My files:", dataArray);

        if (!dataArray || dataArray.length === 0) {
          console.log("No file URLs found");
          setData([]);
          return;
        }

        const fileItems = dataArray.map((itemUrl, i) => {
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
                <button
                  onClick={() => setModalOpen(true)}
                  className="action-button share-button-item"
                  title="Share Access to All Files"
                >
                  <Share2 size={18} />
                </button>
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
      } catch (e) {
        console.error("Error in display function call:", e);
        if (e.message?.includes("You don\'t have access")) {
          setError("Access Denied: You don\'t have permission to view these files.");
        } else if (e.code === 'CALL_EXCEPTION') {
          setError("No files found or you don't have access. Try uploading a file first.");
        } else {
          setError("Error fetching files. Please check console or try again.");
        }
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [contract, account]);

  return (
    <div className="display-section">
      {!loading && !error && <h3>My Files</h3>}
      
      {loading && (
        <div className="loading-indicator">
          <Loader2 className="icon-spin" size={24} />
          <p>Loading files...</p>
        </div>
      )}
      {error && (
        <div className="error-message">
          <AlertCircle size={20} style={{ marginRight: '8px' }} />
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <p className="no-files-message">No files uploaded yet.</p>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="file-grid">{data}</div>
      )}
    </div>
  );
};

export default Display;
