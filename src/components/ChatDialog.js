// src/components/ChatDialog.js

import React from 'react';
import './ChatDialog.css'; // 1. 导入此组件专属的样式文件

// 模拟的聊天数据
const dummyMessages = [
  { id: 1, sender: 'bot', text: '你好！有什么可以帮你的吗？' },
  { id: 2, sender: 'user', text: '我想了解一下关于慢病患者的设计。' },
  { id: 3, sender: 'bot', text: '当然，慢病患者群体通常需要长期的自我管理和支持。我们可以从简化操作流程和提供健康提醒入手。' },
];

function ChatDialog() {
  return (
    <div className="chat-dialog-container">
      {/* 2. 消息列表区域 */}
      <div className="messages-list">
        {dummyMessages.map(message => (
          <div 
            key={message.id} 
            // 根据发送者是 'bot' 还是 'user' 来应用不同的样式
            className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      {/* 3. 底部输入框区域 (暂时做成静态的占位符) */}
      <div className="chat-input-area">
        <div className="fake-input"></div>
        <div className="fake-button"></div>
      </div>
    </div>
  );
}

export default ChatDialog;