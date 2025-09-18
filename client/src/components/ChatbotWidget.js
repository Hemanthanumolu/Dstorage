import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, AlertCircle } from 'lucide-react';
import './ChatbotWidget.css';

const DEFAULT_API_URL = 'http://localhost:8000/api/chat';

const ChatbotWidget = ({ account }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi there! I can answer questions about the files you have uploaded. Ask me anything.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const apiUrl = process.env.REACT_APP_RAG_API_URL || DEFAULT_API_URL;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    const userMessage = { role: 'user', content: trimmedMessage };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: trimmedMessage,
          account: account || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantReply =
        data.answer || data.response || data.message || 'I could not generate a response.';

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantReply },
      ]);
    } catch (err) {
      console.error('Error querying the RAG service:', err);
      setError('Unable to reach the RAG service. Please try again later.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I was unable to reach the knowledge base service. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="chatbot-widget">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <MessageCircle size={20} />
              <div>
                <p className="chatbot-title">AI Assistant</p>
                <p className="chatbot-subtitle">
                  {account ? 'Connected to your RAG workspace' : 'Connect your wallet for personalised answers'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={toggleOpen}
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chatbot-message ${message.role}`}
              >
                <p>{message.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message assistant loading">
                <Loader2 className="spin" size={18} />
                <p>Thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              placeholder={account ? 'Ask a question about your files...' : 'Connect your wallet to chat'}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={!account || isLoading}
            />
            <button type="submit" disabled={!account || isLoading || !inputValue.trim()}>
              {isLoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            </button>
          </form>

          {error && (
            <div className="chatbot-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls="chatbot-window"
      >
        <MessageCircle size={22} />
        <span>Ask AI</span>
      </button>
    </div>
  );
};

export default ChatbotWidget;
