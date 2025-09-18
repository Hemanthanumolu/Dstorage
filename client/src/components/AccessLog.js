import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import './AccessLog.css';

const AccessLog = ({ contract, account }) => {
  const [accessHistory, setAccessHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccessHistory = async () => {
      if (!contract || !account) return;

      setLoading(true);
      setError(null);

      try {
        const history = await contract.getAccessHistory();
        console.log("Access History:", history);

        const formattedHistory = history.map(item => ({
          fileOwner: item.fileOwner,
          fileUrl: item.fileUrl,
          grantedTo: item.grantedTo,
          timestamp: new Date(item.timestamp * 1000).toLocaleString()
        }));

        setAccessHistory(formattedHistory);
      } catch (err) {
        console.error("Error fetching access history:", err);
        setError("Failed to fetch access history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccessHistory();
  }, [contract, account]);

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="icon-spin" size={24} />
        <p>Loading access history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={20} style={{ marginRight: '8px' }} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="access-log-container">
      <h2>Access History</h2>
      {accessHistory.length === 0 ? (
        <p className="no-history">No access history found.</p>
      ) : (
        <div className="history-list">
          {accessHistory.map((item, index) => (
            <div key={index} className="history-item">
              <div className="history-header">
                <span className="file-name">
                  File: {item.fileUrl.split('/').pop()}
                </span>
                <span className="timestamp">
                  <Clock size={14} style={{ marginRight: '4px' }} />
                  {item.timestamp}
                </span>
              </div>
              <div className="history-details">
                <p>Owner: {item.fileOwner}</p>
                <p>Access granted to: {item.grantedTo}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessLog; 