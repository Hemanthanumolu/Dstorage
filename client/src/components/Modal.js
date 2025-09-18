import { useState, useEffect } from "react";
import { X, Share2, UserCheck, Loader2 } from 'lucide-react'; // Icons
import "./Modal.css";

const Modal = ({ setModalOpen, contract }) => {
  const [shareAddress, setShareAddress] = useState('');
  const [accessList, setAccessList] = useState([]);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [sharingInProgress, setSharingInProgress] = useState(false);
  const [error, setError] = useState(null);

  // Fetch existing access list
  useEffect(() => {
    const loadAccessList = async () => {
      if (!contract) return;
      setLoadingAccess(true);
      setError(null); // Clear previous errors
      try {
        // Assuming shareAccess returns Access[] structs
        const accessStructs = await contract.shareAccess(); 
        // Filter for users who currently have access
        const grantedAddresses = accessStructs
          .filter(item => item.access) // Only keep if access is true
          .map(item => item.user); // Extract the user address
          
        console.log("Loaded access list:", grantedAddresses);
        setAccessList(grantedAddresses || []); // Ensure it's an array
      } catch (err) {
        console.error("Error loading access list:", err);
        setError("Could not load access list. Check console.");
      } finally {
        setLoadingAccess(false);
      }
    };
    loadAccessList();
  }, [contract]);

  // Share access function
  const handleSharing = async () => {
    setError(null); // Clear previous errors
    
    // --- Input Validation using Regex --- 
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(shareAddress)) {
      const errorMsg = "Invalid address format. Please enter a valid Ethereum address starting with 0x followed by 40 hex characters.";
      setError(errorMsg);
      alert(errorMsg);
      return; // Stop execution if address format is invalid
    }
    // --- End Validation --- 

    if (!contract) {
       setError("Contract not available.");
       return;
    }

    setSharingInProgress(true);
    try {
      console.log("Attempting to grant access to:", shareAddress);
      const tx = await contract.allow(shareAddress);
      console.log("Grant access transaction sent:", tx.hash);
      await tx.wait(); // Wait for transaction confirmation
      console.log("Grant access transaction confirmed for:", shareAddress);
      
      // Update local list optimistically
      setAccessList(prev => {
        // Avoid adding duplicates
        if (!prev.includes(shareAddress)) {
          return [...prev, shareAddress];
        }
        return prev;
      }); 
      
      setShareAddress(''); // Clear input
      alert(`Access granted successfully to ${shareAddress}`);
    } catch (err) {
      console.error("Error granting access:", err);
      let message = "Failed to grant access. Check console.";
      // Check for specific contract revert reasons
      const reasonMatch = err.data?.message?.match(/reverted with reason string '([^']*)'/);
      if (reasonMatch) {
        message = `Contract Error: ${reasonMatch[1]}`;
      } else if (err.data?.message) {
        message = `Transaction Error: ${err.data.message}`;
      } else if (err.message) {
        message = `Error: ${err.message}`;
      }
      setError(message);
      alert(message); // Show alert as well
    } finally {
      setSharingInProgress(false);
    }
  };

  // Function to revoke access (Placeholder - needs contract.disallow)
  const handleRevoke = async (addressToRevoke) => {
    alert(`Revoke function for ${addressToRevoke} needs implementation (calling contract.disallow).`);
    // Implementation:
    // setError(null);
    // try {
    //   const tx = await contract.disallow(addressToRevoke);
    //   await tx.wait();
    //   setAccessList(prev => prev.filter(addr => addr !== addressToRevoke));
    //   alert(`Access revoked for ${addressToRevoke}`);
    // } catch (err) {
    //   console.error("Error revoking access:", err);
    //   // Handle errors similarly to handleSharing
    // }
  };

  return (
    <div className="modal-backdrop" onClick={() => setModalOpen(false)}> {/* Close on backdrop click */} 
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside */} 
        <div className="modal-header">
          <h4 className="modal-title">Share Access</h4>
          <button onClick={() => setModalOpen(false)} className="modal-close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {error && <p className="modal-error">Error: {error}</p>}
          
          <div className="share-input-group">
            <input
              type="text"
              value={shareAddress}
              onChange={(e) => setShareAddress(e.target.value)}
              placeholder="Enter Wallet Address (0x...)"
              className="share-address-input"
              disabled={sharingInProgress}
            />
            <button 
              onClick={handleSharing} 
              className="share-action-button grant-button" 
              disabled={!shareAddress || sharingInProgress}
            >
              {sharingInProgress ? <Loader2 size={18} className="icon-spin" /> : <Share2 size={18} />}
              <span>{sharingInProgress ? 'Sharing...' : 'Grant Access'}</span>
            </button>
          </div>

          <h5><UserCheck size={16} style={{ marginRight: '8px' }}/> People With Access</h5>
          {loadingAccess ? (
            <p className="loading-text">Loading access list...</p>
          ) : accessList.length > 0 ? (
            <ul className="access-list">
              {accessList.map((addr, i) => (
                <li key={i} className="access-list-item">
                  <span className="access-list-address" title={addr}>{addr}</span>
                  {/* Add Revoke Button Here - requires handleRevoke implementation */}
                  {/* <button onClick={() => handleRevoke(addr)} className="revoke-button" title="Revoke Access">
                    <UserX size={16} />
                  </button> */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-access-text">No one else has access yet.</p>
          )}
        </div>

        {/* Optional Footer for just a close button */}
        {/* <div className="modal-footer">
          <button onClick={() => setModalOpen(false)} className="modal-close-secondary">Close</button>
        </div> */}
      </div>
    </div>
  );
};

export default Modal;
