// src/components/ChatDialog.js

import React, { useState, useEffect, useRef } from 'react';
import './ChatDialog.css';

/**
 * ChatDialog Component
 * @param {object} props
 * @param {string} props.initialBotMessage - The first message the bot displays.
 * @param {function} props.getAiResponse - An async function that takes user input and message history, and returns an object: { responseText, extractedData, isTaskComplete }.
 * @param {function} props.onTaskComplete - A callback function triggered when the AI signals the task is complete. It receives the extracted data.
 */
// MODIFICATION 1: Renamed props for clarity and to match the new architecture.
function ChatDialog({ initialBotMessage, getAiResponse, onTaskComplete }) {
  // 1. 状态管理 (No changes here)
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 2. 自动滚动功能 (No changes here)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // 3. 设置初始机器人消息 (No changes here)
  useEffect(() => {
    // Added a check to prevent re-adding the initial message on re-renders
    if (messages.length === 0) {
      setMessages([{ id: Date.now(), sender: 'bot', text: initialBotMessage }]);
    }
  }, [initialBotMessage, messages.length]);

  // 4. 处理用户提交
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: userInput };
    
    // We'll pass the *updated* message list to the API function
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      // 5. 调用父组件传入的API函数
      // MODIFICATION 2: The function is now called `getAiResponse` and it receives the most current message list.
      const apiResponse = await getAiResponse(userInput, updatedMessages); 
      const botMessage = { id: Date.now() + 1, sender: 'bot', text: apiResponse.responseText };

      setMessages(prevMessages => [...prevMessages, botMessage]);

      // MODIFICATION 3: This is the core logic change.
      // We now check for the `isTaskComplete` flag from the backend.
      // If it's true, we call the `onTaskComplete` callback with the extracted data.
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

  // The JSX remains the same.
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