# 🚀 Dstorage – Decentralized Storage with RAG Integration

## 📌 Overview
**Dstorage** is a decentralized storage system integrated with a **Retrieval-Augmented Generation (RAG) bot**. Users can upload files to a blockchain-based storage layer, and then privately query those files using an AI model enhanced with retrieval. This ensures **privacy, decentralization, and intelligent knowledge access**.

---

## ✨ Features
- 📂 Decentralized file storage (blockchain/IPFS).  
- 🔑 Privacy-first design – files remain user-owned.  
- 🤖 RAG Bot integration – chat with your private files.  
- ⚙️ Configurable AI parameters (`k`, `temperature`, etc.).  
- 🌐 Scalable architecture, extendable with Web3 tools.  

---

## ⚙️ Tech Stack
- **Blockchain / IPFS** → decentralized storage  
- **Python (RAG)** → embeddings, retriever, LLM pipeline  
- **LangChain / Custom retriever** → document search  
- **Qwen / GPT / LLaMA** → large language model integration  
- **Node.js / Python backend** → APIs & storage operations  

---

## 🚀 Installation

```bash
# Clone repository
git clone https://github.com/Hemanthanumolu/Dstorage.git
cd Dstorage

# Install backend dependencies
npm install    # if Node.js
# OR
pip install -r requirements.txt   # if Python
Project Structure
Dstorage/
├── backend/        # Blockchain + storage interaction
├── rag/            # Retrieval-Augmented Generation pipeline
├── uploads/        # Uploaded files (local/dev only)
├── requirements.txt
├── package.json
└── README.md

✅ Roadmap
->Full IPFS integration
->End-to-end file encryption
->Multi-LLM support (Qwen, GPT, LLaMA)
->Web dashboard for file upload & chat
