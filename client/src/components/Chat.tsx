import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import './Chat.css';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentUserId }) => {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const unreadCount = messages.length > 0 && !isOpen ? 1 : 0;

  return (
    <div className={`chat-container ${isOpen ? 'chat-open' : 'chat-closed'}`}>
      <div className="chat-toggle" onClick={handleToggle}>
        <span className="chat-icon">💬</span>
        <span className="chat-label">Chat</span>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>💬 Chat live</h3>
            <button className="close-btn" onClick={handleToggle}>×</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>Niciun mesaj încă...</p>
                <p>Începe conversația! 🎮</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.userId === currentUserId ? 'own-message' : 'other-message'}`}
                >
                  <div className="message-header">
                    <span className="username">{msg.username}</span>
                    <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="message-text">{msg.message}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrie un mesaj..."
              className="chat-input"
              maxLength={200}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!message.trim()}
            >
              📤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;