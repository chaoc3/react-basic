// src/pages/Page3_Target-User.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page3_Target-User.module.css';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/页面剩余素材/Page345页面.svg';

// getAiResponse 函数保持不变...
const getAiResponse = async (userInput, currentMessages) => {
  console.log("1. [FRONTEND] 开始调用 getAiResponse 函数...");

  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));
  messagesForApi.push({ role: 'user', content: userInput });

  const requestBody = {
    messages: messagesForApi,
    task: 'getTargetUser'
  };

  console.log("2. [FRONTEND] 准备发送到 /api/chat 的请求体:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log("3. [FRONTEND] 收到来自后端的原始响应:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`4. [FRONTEND] API 请求失败，状态码: ${response.status}, 响应内容: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("4. [FRONTEND] 成功解析后端的 JSON 数据:", data);
    
    return {
      responseText: data.responseText,
      extractedData: data.extractedData,
    };

  } catch (error) {
    console.error("5. [FRONTEND] 在 fetch 或解析 JSON 时捕获到严重错误:", error);
    return {
      responseText: "抱歉，网络连接或服务器似乎出了点问题，请检查控制台信息。",
      extractedData: null,
    };
  }
};


const Page3_TargetUser = () => {
  const navigate = useNavigate();
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [extractedUserData, setExtractedUserData] = useState(null);

  const handleDataExtracted = (data) => {
    console.log("任务完成，提取到的数据:", data);
    setExtractedUserData(data);
    setIsTaskComplete(true);
  };
  
  const handleNext = () => {
    navigate('/target-painpoint', { state: { userData: extractedUserData } });
  };

  return (
    <div className={styles.pageContainer}
        style={{ backgroundImage: `url(${backgroundForPage})` }}
    >
      <BranchSelector />

      {/* 使用一个容器来相对定位内部元素 */}
      <div className={styles.mainContent}>

        {/* 顶部气泡文字 */}
        <div className={styles.titleBubble}>
          <p style={{ fontWeight: 'bold' }}>让我们一起确定你的设计目标吧!</p>
          <p>你希望这个智能代理来帮助什么样的用户群体呢？可以用一句话告诉我,他们是谁、正在经历什么。</p>
        </div>

        {/* 聊天框容器 */}
        <div className={styles.chatWrapper}>
          <ChatDialog 
            initialBotMessage="你希望这个智能代理来帮助什么样的用户群体呢？可以用一句话告诉我，他们是谁、正在经历什么。"
            onSendMessage={getAiResponse}
            onDataExtracted={handleDataExtracted}
          />
        </div>
      </div>

      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
    </div>
  );
};

export default Page3_TargetUser;