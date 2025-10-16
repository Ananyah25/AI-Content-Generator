// components/ChatInterface.js
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/content/conversations');
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/content/conversations/${conversationId}/messages`);
      const data = await response.json();
      
      const loadedMessages = data.messages.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));

      setMessages(loadedMessages);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSelectedConversation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMessage]);

      const response = await fetch('http://localhost:8000/api/content/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          stream: true,
          conversation_id: selectedConversation || 'default'
        }),
      });

      const reader = response.body.getReader();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk' && data.content) {
                accumulatedContent += data.content;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore JSON parsing errors
            }
          }
        }
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        )
      );

      setTimeout(() => fetchHistory(), 1000);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 2,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={startNewChat}>
            ✏️ New chat
          </button>
        </div>

        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        

        <div className="conversations-section">
          <div className="section-title">Chats</div>
          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="no-conversations">No conversations yet</div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="conversation-title">
                    {conv.title}
                  </div>
                  <div className="conversation-date">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {messages.length === 0 ? (
          <div className="welcome-area">
            <div className="welcome-message">
              <h1>AI Content Generator</h1>
              
            </div>
          </div>
        ) : (
          <div className="messages-area">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.type}-message`}>
                <div className="message-avatar">
                  {message.type === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {message.type === 'user' ? (
                    <div className="user-content">{message.content}</div>
                  ) : (
                    <div className="ai-content">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      {message.isStreaming && (
                        <div className="typing-indicator">●●●</div>
                      )}
                    </div>
                  )}
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="input-area">
          <form className="input-form" onSubmit={handleSubmit}>
            <div className="input-wrapper">
              
              <textarea
                ref={inputRef}
                className="message-input"
                placeholder="Ask anything"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                rows={1}
              />
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  '➤'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
