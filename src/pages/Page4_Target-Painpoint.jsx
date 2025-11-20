// src/pages/Page4_TargetPainpoint.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from './styles/Page3_Target-User.module.css'; 
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/背景带文字/Page4-Target-Painpoint.svg';
import { useDesign } from '../context/DesignContext'; 

// 为 Page4 创建一个专门的 API 调用函数
const getAiResponseForPainpoint = async (userInput, currentMessages) => {
  console.log("1. [FRONTEND-P4] 开始调用 getAiResponseForPainpoint...");

  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));
  // 既然使用了 Vercel AI SDK 模式的 ChatDialog，这里通常不需要手动 push 用户输入，
  // 除非你的 ChatDialog 实现有特殊逻辑。为了保险起见保持原样：
  // messagesForApi.push({ role: 'user', content: userInput });

  const requestBody = {
    messages: messagesForApi,
    task: 'getTargetPainpoint' 
  };

  console.log("2. [FRONTEND-P4] 准备发送到 /api/chat 的请求体:", JSON.stringify(requestBody, null, 2));

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
    console.log("4. [FRONTEND-P4] 成功解析 JSON:", data);
    
    return data;

  } catch (error) {
    console.error("5. [FRONTEND-P4] 捕获到严重错误:", error);
    return { 
      responseText: "抱歉，网络连接或服务器似乎出了点问题，请稍后再试。", 
      extractedData: null,
      isTaskComplete: false,
    };
  }
};


const Page4_TargetPainpoint = () => {
  const navigate = useNavigate();
  const { updateDesignData } = useDesign(); 
  const [isTaskComplete, setIsTaskComplete] = useState(false);

  const handleTaskComplete = (data) => {
    console.log("P4 任务完成，准备跳转。提取到的数据:", data);
    
    if (data && data.targetPainpoint) {
      updateDesignData('targetPainpoint', data.targetPainpoint);
      setIsTaskComplete(true); 
    }

    setTimeout(() => {
      navigate('/target-stage'); 
    }, 1500); 
  };
  
  const handleNext = () => {
    navigate('/target-stage'); 
  };

  return (
    <div className={styles.pageContainer} style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <BranchSelector />
      <div className={styles.mainContent}>
        
        {/* 已删除 titleBubble */}

        <div className={styles.chatWrapper}>
          <ChatDialog 
            getAiResponse={getAiResponseForPainpoint} 
            onTaskComplete={handleTaskComplete} 
            // 建议：既然删除了气泡，这里的初始消息可以稍微丰富一点，包含之前的提示信息
            initialBotMessage="你希望这个智能代理去改变的健康问题是什么？可以用一句话告诉我你的设计发现或痛点。"
          />
        </div>
      </div>
      
      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
    </div>
  );
};

export default Page4_TargetPainpoint;