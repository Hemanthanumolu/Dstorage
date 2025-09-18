import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { UploadCloud, Loader2, File as FileIcon, AlertCircle } from 'lucide-react';
import "./FileUpload.css";

const FileUpload = ({ contract, account }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Check connection status whenever contract or account changes
  useEffect(() => {
    if (!account || !contract) {
      setError("Please connect your wallet and ensure the contract is loaded.");
    } else {
      setError(null);
    }
  }, [account, contract]);

  const retrieveFile = (selectedFile) => {
    setError(null); // Clear any previous errors
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      console.log("File selected:", selectedFile.name);
    } else {
      setFileName("");
      setFile(null);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    retrieveFile(e.target.files[0]);
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      retrieveFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = async () => {
    setError(null); // Clear any previous errors

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    if (!contract || !account) {
      setError("Wallet not connected or contract not loaded. Please try reconnecting your wallet.");
      return;
    }

    setUploading(true);
    setUploadProgress("Uploading to IPFS...");
    
    try {
      console.log("Starting file upload process...");
      console.log("Contract status:", contract ? "Connected" : "Not Connected");
      console.log("Account status:", account ? "Connected" : "Not Connected");

      // Add debug logging for environment variables
      console.log("API Key available:", !!process.env.REACT_APP_PINATA_API_KEY);
      console.log("Secret Key available:", !!process.env.REACT_APP_PINATA_SECRET_API_KEY);

      const formData = new FormData();
      formData.append("file", file);
      
      console.log("Uploading to Pinata...");
      const resFile = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "pinata_api_key": process.env.REACT_APP_PINATA_API_KEY || '',
            "pinata_secret_api_key": process.env.REACT_APP_PINATA_SECRET_API_KEY || ''
          },
        }
      );

      const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      console.log("IPFS Hash:", ImgHash);

      setUploadProgress("Adding file to contract...");
      console.log("Calling contract.add with account:", account);
      const addTx = await contract.add(account, ImgHash);
      console.log("Transaction sent:", addTx.hash);
      
      await addTx.wait();
      console.log("Transaction confirmed!");

      alert("File Uploaded Successfully!");
      setFile(null);
      setFileName("");

    } catch (error) {
      console.error("Upload Failed:", error);
      if (error.response?.status === 403) {
        setError("Authentication failed with Pinata. Please check your API keys.");
      } else {
        setError(error.message || 'Upload failed. Please check console for details.');
      }
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="upload-section">
      {error && (
        <div className="upload-error-message">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onClick={handleSelectFileClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload-hidden"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          disabled={uploading || !account || !contract}
        />
        
        {!file ? (
          <div className="drop-prompt">
            <UploadCloud size={48} className="upload-icon" />
            <p>Drag files here or click to upload</p>
            <span className="support-text">Support for PDF, JPEG, and PNG files up to 5MB</span>
            <button 
              type="button" 
              className="select-files-button" 
              onClick={(e) => { e.stopPropagation(); handleSelectFileClick(); }}
              disabled={uploading || !account || !contract}
            >
              Select Files
            </button>
          </div>
        ) : (
          <div className="file-preview-area">
            <FileIcon size={40} className="file-icon"/>
            <span className="selected-filename" title={fileName}>{fileName}</span>
            <button 
              type="button" 
              className="upload-selected-button" 
              onClick={handleSubmit} 
              disabled={uploading || !account || !contract}
            >
              {uploading ? (
                <>
                  <Loader2 className="icon-spin" size={18} style={{ marginRight: '8px' }}/> 
                  {uploadProgress || 'Uploading...'}
                </>
              ) : (
                'Upload Now'
              )}
            </button>
            <button 
                type="button"
                onClick={() => retrieveFile(null)} 
                className="clear-selection-button"
                disabled={uploading}
                title="Clear Selection"
            > &times; </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
