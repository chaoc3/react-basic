// ChatDialog.jsx

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'; // <--- 1. 引入库
import './ChatDialog.css';

function ChatDialog({ initialBotMessage, getAiResponse, onDataExtracted, onTaskComplete }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (initialBotMessage) {
      setMessages(prevMessages => {
        if (prevMessages.length === 0) {
          return [{ id: Date.now(), sender: 'bot', text: initialBotMessage }];
        } else if (prevMessages.length === 1 && prevMessages[0].sender === 'bot') {
          if (prevMessages[0].text !== initialBotMessage) {
            return [{ id: prevMessages[0].id, sender: 'bot', text: initialBotMessage }];
          }
        }
        return prevMessages;
      });
    }
  }, [initialBotMessage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: userInput };
    
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const apiResponse = await getAiResponse(userInput, currentMessages); 

      if (!apiResponse || typeof apiResponse.responseText !== 'string') {
        throw new Error("Invalid API response structure");
      }

      const botMessage = { id: Date.now() + 1, sender: 'bot', text: apiResponse.responseText };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);

      if (apiResponse.extractedData && onDataExtracted) {
        onDataExtracted(apiResponse.extractedData);
      }

      if (apiResponse.isTaskComplete && onTaskComplete) {
        onTaskComplete(apiResponse.extractedData); 
      }

    } catch (error) {
      console.error("API call failed in ChatDialog:", error);
      const errorMessage = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: "抱歉，我这边好像出了一点问题，请稍后再试。"
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-dialog-container">
      <div className="messages-list">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {/* --- ▼▼▼ 关键修改: 使用 ReactMarkdown 渲染文本 ▼▼▼ --- */}
            {/* 只有机器人的消息使用 Markdown 渲染，用户消息保持纯文本以防样式混乱 */}
            {message.sender === 'bot' ? (
              <div className="markdown-content">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            ) : (
              message.text
            )}
            {/* --- ▲▲▲ 修改结束 ▲▲▲ --- */}
          </div>
        ))}
        {isLoading && (
          <div className="chat-message bot-message typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="请在这里输入..."
          disabled={isLoading}
        />
        <button type="submit" className="send-button" disabled={isLoading}>
          发送
        </button>
      </form>
    </div>
  );
}

export default ChatDialog;