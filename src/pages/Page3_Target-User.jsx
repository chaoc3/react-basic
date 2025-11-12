// src/pages/Page3_Target-User.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page3_Target-User.module.css';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/页面剩余素材/Page345页面.svg';
import Page16_Sum from './Page16_Sum';
import { useDesign } from '../context/DesignContext'; 


// getAiResponse 函数保持不变，它依然负责与后端通信
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
  const { updateDesignData } = useDesign();
  
  // --- 修改 1: 移除了 isTaskComplete 状态 ---
  // const [isTaskComplete, setIsTaskComplete] = useState(false); 
  
  const [extractedUserData, setExtractedUserData] = useState(null);
  const [isSumOpen, setIsSumOpen] = useState(false);
  const [sumEntryPoint, setSumEntryPoint] = useState('');

  const handleDataExtracted = (data) => {
    console.log("任务完成，提取到的数据:", data);
    // 即使按钮可以随时点击，我们仍然需要保存 AI 返回的数据
    updateDesignData('targetUser', data); 
    setExtractedUserData(data);
    
    // --- 修改 2: 移除了 setIsTaskComplete 的调用 ---
    // setIsTaskComplete(true);
  };
  
  const handleOpenSum = (entry) => {
    setSumEntryPoint(entry);
    setIsSumOpen(true);
  };

  const handleCloseSum = (entryPoint) => {
    setIsSumOpen(false);
    if (entryPoint === 'page15Next') {
      navigate('/achieve');
    }
  };

  const handleNext = () => {
    // 这个函数现在可以无条件地被调用
    navigate('/target-painpoint'); 
  };

  return (
    <div className={styles.pageContainer}
        style={{ backgroundImage: `url(${backgroundForPage})` }}
    >
      <BranchSelector onTimelineClick={() => handleOpenSum('timeline')} />
      
      <div className={styles.mainContent}>
        <div className={styles.titleBubble}>
          <p style={{ fontWeight: 'bold' }}>让我们一起确定你的设计目标吧!</p>
          <p>你希望这个智能代理来帮助什么样的用户群体呢？可以用一句话告诉我,他们是谁、正在经历什么。</p>
        </div>

        <div className={styles.chatWrapper}>
          <ChatDialog 
            initialBotMessage="你希望这个智能代理来帮助什么样的用户群体呢？可以用一句话告诉我，他们是谁、正在经历什么。"
            onSendMessage={getAiResponse}
            onDataExtracted={handleDataExtracted}
          />
        </div>
      </div>

      {/* --- 修改 3: 移除了 ArrowButton 的 disabled 属性 --- */}
      <ArrowButton onClick={handleNext} />
      
      <Page16_Sum 
        isOpen={isSumOpen} 
        onClose={handleCloseSum}
        entryPoint={sumEntryPoint}
      />
    </div>
  );
};

export default Page3_TargetUser;