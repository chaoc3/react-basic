// src/pages/Page3_Target-User.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page3_Target-User.module.css';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/背景带文字/Page3-Target-User.svg';
import Page16_Sum from './Page16_Sum';
import { useDesign } from '../context/DesignContext';

// MODIFICATION START: 保持原有的 getAiResponse 不变
const getAiResponse = async (userInput, currentMessages) => {
  console.log("1. [FRONTEND] 开始调用 getAiResponse 函数...");

  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));

  const requestBody = {
    messages: messagesForApi,
    task: 'getTargetUser' 
  };

  console.log("2. [FRONTEND] 准备发送到 /api/chat 的请求体:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 请求失败，状态码: ${response.status}, 响应内容: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("4. [FRONTEND] 成功解析后端的 JSON 数据:", data);
    
    return data;

  } catch (error) {
    console.error("5. [FRONTEND] 在 fetch 或解析 JSON 时捕获到严重错误:", error);
    return {
      responseText: "抱歉，网络连接或服务器似乎出了点问题，请稍后再试。",
      extractedData: null,
      isTaskComplete: false,
    };
  }
};
// MODIFICATION END


const Page3_TargetUser = () => {
  const navigate = useNavigate();
  const { updateDesignData } = useDesign();
  
  const [isSumOpen, setIsSumOpen] = useState(false);
  const [sumEntryPoint, setSumEntryPoint] = useState('');

  const handleTaskComplete = (data) => {
    console.log("任务完成，准备跳转。提取到的数据:", data);
    
    if (data && data.targetUser) {
      updateDesignData('targetUser', data.targetUser);
    }

    setTimeout(() => {
      navigate('/target-painpoint'); 
    }, 1500); 
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
    navigate('/target-painpoint'); 
  };

  return (
    <div className={styles.pageContainer}
        style={{ backgroundImage: `url(${backgroundForPage})` }}
    >
      <BranchSelector onTimelineClick={() => handleOpenSum('timeline')} />
      
      <div className={styles.mainContent}>
        {/* 
            已删除 titleBubble div 
            因为 chatWrapper 是绝对定位到底部的，所以这里删除不会影响 chatWrapper 的位置
        */}

        <div className={styles.chatWrapper}>
          <ChatDialog 
            initialBotMessage="你希望这个智能代理来帮助什么样的用户群体呢？可以用一句话告诉我，他们是谁、正在经历什么。"
            getAiResponse={getAiResponse} 
            onTaskComplete={handleTaskComplete} 
          />
        </div>
      </div>

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