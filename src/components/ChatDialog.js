// ChatDialog.jsx

import React, { useState, useEffect, useRef } from 'react';
import './ChatDialog.css';

/**
 * ChatDialog Component
 * @param {object} props
 * @param {string} props.initialBotMessage - The first message the bot displays.
 * @param {function} props.getAiResponse - An async function that takes (userInput, messageHistory) and returns a full API response object. // <--- 更改注释
 * @param {function} props.onDataExtracted - A callback for when the AI extracts data.
 * @param {function} props.onTaskComplete - A callback for when the AI signals the task is complete.
 */
// 更改函数签名，将 onSendMessage 替换为 getAiResponse
function ChatDialog({ initialBotMessage, getAiResponse, onDataExtracted, onTaskComplete }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动功能 (无需修改)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // 设置初始机器人消息 (无需修改)
  useEffect(() => {
    if (messages.length === 0 && initialBotMessage) {
      setMessages([{ id: Date.now(), sender: 'bot', text: initialBotMessage }]);
    }
  }, [initialBotMessage, messages.length]);

  // 处理用户提交的核心逻辑
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: userInput };
    
    // 立即将用户消息显示在界面上
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      // --- ▼▼▼ 关键修改 1: 调用 getAiResponse ▼▼▼ ---
      // 调用 getAiResponse，而不是 onSendMessage
      const apiResponse = await getAiResponse(userInput, messages); 
      // --- ▲▲▲ 修改结束 ▲▲▲ ---

      // 确保我们收到了一个有效的响应
      if (!apiResponse || typeof apiResponse.responseText !== 'string') {
        throw new Error("Invalid API response structure");
      }

      const botMessage = { id: Date.now() + 1, sender: 'bot', text: apiResponse.responseText };
      
      // 将机器人的回复添加到消息列表
      setMessages(prevMessages => [...prevMessages, botMessage]);

      // --- ▼▼▼ 关键修改 2: 数据处理逻辑 ▼▼▼ ---
      // 这个逻辑现在更加清晰，因为它直接处理从 onSendMessage 返回的完整对象。

      // 1. 检查是否有提取出的数据，并调用 onDataExtracted
      // 这个回调应该在每次AI返回数据时都检查，而不仅仅是在任务完成时
      if (apiResponse.extractedData && onDataExtracted) {
        onDataExtracted(apiResponse.extractedData);
      }

      // 2. 检查任务是否完成，并调用 onTaskComplete
      if (apiResponse.isTaskComplete && onTaskComplete) {
        onTaskComplete(apiResponse.extractedData); // 任务完成时，将提取的数据传回给父组件
      }
      // --- ▲▲▲ 修改结束 ▲▲▲ ---

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

  // JSX 渲染部分 (无需修改)
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