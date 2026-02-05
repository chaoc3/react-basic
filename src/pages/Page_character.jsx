// src/pages/Page5_TargetStage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page3_Target-User.module.css';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/背景带文字/增加页面-剩余3个阶段方案.png';
import { useDesign } from '../context/DesignContext'; 

// 为 Page5 创建一个专门的 API 调用函数
const getAiResponseForStage = async (userInput, currentMessages) => {
  console.log("1. [FRONTEND-P5] 开始调用 getAiResponseForStage 函数...");

  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));

  const requestBody = {
    messages: messagesForApi,
    task: 'getTargetStage' 
  };

  console.log("2. [FRONTEND-P5] 准备发送到 /api/chat 的请求体:", JSON.stringify(requestBody, null, 2));

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
    console.log("4. [FRONTEND-P5] 成功解析 JSON:", data);
    
    return data;

  } catch (error) {
    console.error("5. [FRONTEND-P5] 捕获到严重错误:", error);
    return { 
      responseText: "抱歉，网络连接或服务器似乎出了点问题，请稍后再试。", 
      extractedData: null,
      isTaskComplete: false,
    };
  }
};


const Page_character = () => {
  const navigate = useNavigate();
  const { updateDesignData } = useDesign(); 
  const [isTaskComplete, setIsTaskComplete] = useState(false); 

  const handleTaskComplete = (data) => {
    console.log("P5 任务完成，准备跳转。提取到的数据:", data);
    
    if (data && data.targetStage) {
      updateDesignData('targetStage', data.targetStage);
      setIsTaskComplete(true); 
    }

    setTimeout(() => {
      navigate('/page6'); 
    }, 1500); 
  };
  
  const handleNext = () => {
    navigate('/user-select-1'); 
  };

  // 初始消息保持不变，因为它已经包含了足够的上下文
  const initialBotMessage = `让我们一起确定你的设计阶段吧！
  接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。
  我这里有四个阶段供你参考：目标设定阶段、策略规划阶段、执行检测阶段和自我反思阶段。
  你想主要细化哪一阶段的策略呢？可以和我聊聊你的想法。`;


  return (
    <div className={styles.pageContainer}
    style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <BranchSelector />

      <div className={styles.mainContent}>

        {/* 已删除 titleBubble */}

        <div className={styles.chatWrapper}>
          <ChatDialog 
            getAiResponse={getAiResponseForStage}
            onTaskComplete={handleTaskComplete}
            initialBotMessage={initialBotMessage}
          />
        </div>
      </div>
      
      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
    </div>
  );
};

export default Page_character;