// src/components/ChatDialog.js

import React, { useState, useEffect, useRef } from 'react';
import './ChatDialog.css';

/**
 * ChatDialog Component
 * @param {object} props
 * @param {string} props.initialBotMessage - The first message the bot displays.
 * @param {function} props.onSendMessage - An async function to call when the user sends a message. It receives the user's text and should return the bot's response.
 * @param {function} props.onDataExtracted - A callback function that gets triggered when the API returns specific data, signaling a task is complete.
 */
function ChatDialog({ initialBotMessage, onSendMessage, onDataExtracted }) {
  // 1. 状态管理
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // 用于自动滚动到最新消息

  // 2. 自动滚动功能
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); // 每当 messages 更新时，执行滚动

  // 3. 设置初始机器人消息
  useEffect(() => {
    setMessages([{ id: Date.now(), sender: 'bot', text: initialBotMessage }]);
  }, [initialBotMessage]);

  // 4. 处理用户提交
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: userInput };
    
    // 立即更新UI，显示用户消息
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // 5. 调用父组件传入的API函数
      const apiResponse = await onSendMessage(userInput, messages);
      const botMessage = { id: Date.now() + 1, sender: 'bot', text: apiResponse.responseText };

      // 更新UI，显示机器人回复
      setMessages(prevMessages => [...prevMessages, botMessage]);

      // 6. 如果API返回了需要的数据，则通知父组件
      if (apiResponse.extractedData) {
        onDataExtracted(apiResponse.extractedData);
      }

    } catch (error) {
      console.error("API call failed:", error);
      const errorMessage = { id: Date.now() + 1, sender: 'bot', text: error};
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
            {message.text}
          </div>
        ))}
        {/* 当机器人正在 "思考" 时显示加载提示 */}
        {isLoading && (
          <div className="chat-message bot-message typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
        {/* 空 div 用于自动滚动定位 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 真实的输入表单 */}
      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="请在这里输入..."
          disabled={isLoading} // 加载时禁用输入框
        />
        <button type="submit" className="send-button" disabled={isLoading}>
          发送
        </button>
      </form>
    </div>
  );
}

export default ChatDialog;