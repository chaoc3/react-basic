// src/pages/Page4_TargetPainpoint.jsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 引入 useLocation
import styles from './styles/Page3_Target-User.module.css'; // 假设样式可以复用
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/页面剩余素材/Page345页面.svg';
import { useDesign } from '../context/DesignContext'; // 引入 context

// 为 Page4 创建一个专门的 API 调用函数
const getAiResponseForPainpoint = async (userInput, currentMessages) => {
  console.log("1. [FRONTEND-P4] 开始调用 getAiResponseForPainpoint...");

  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));
  messagesForApi.push({ role: 'user', content: userInput });

  // 关键修改：将 task 设置为 'getTargetPainpoint'
  const requestBody = {
    messages: messagesForApi,
    task: 'getTargetPainpoint' 
  };

  console.log("2. [FRONTEND-P4] 准备发送到 /api/chat 的请求体:", JSON.stringify(requestBody, null, 2));

  try {
    // API 请求部分保持不变
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${errorText}`);
    }

    const data = await response.json();
    console.log("4. [FRONTEND-P4] 成功解析 JSON:", data);
    return data;

  } catch (error) {
    console.error("5. [FRONTEND-P4] 捕获到严重错误:", error);
    return { responseText: "抱歉，出错了，请检查控制台。", extractedData: null };
  }
};


const Page4_TargetPainpoint = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 获取路由状态
  const { updateDesignData } = useDesign(); // 使用 context 更新数据
  const [isTaskComplete, setIsTaskComplete] = useState(false);

  // 从上一页获取数据，虽然本组件不用，但要传递下去
  const previousData = location.state || {};

  const handleDataExtracted = (data) => {
    if (data && data['Target-Painpoint']) { // 检查是否真的提取到了数据
      console.log("任务完成，提取到的数据:", data);
      updateDesignData('targetPainpoint', data); // 更新到全局 context
      setIsTaskComplete(true);
    }
  };
  
  const handleNext = () => {
    // 将之前和当前步骤的数据一起传递到下一页
    navigate('/target-stage', { state: { ...previousData } }); 
  };

  return (
    <div className={styles.pageContainer} style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <BranchSelector />
      <div className={styles.mainContent}>
        <div className={styles.titleBubble}>
          <p style={{ fontWeight: 'bold' }}>太棒了！现在聊聊你想解决的问题吧！</p>
          <p>你希望这个智能代理协助的助推机制想改变的问题是什么？可以用一句话告诉我你的设计发现或痛点。</p>
        </div>
        <div className={styles.chatWrapper}>
          <ChatDialog 
            initialBotMessage="你希望这个智能代理协助的助推机制想改变的问题是什么？"
            onSendMessage={getAiResponseForPainpoint} // <-- 使用新的、正确的函数
            onDataExtracted={handleDataExtracted}
          />
        </div>
      </div>
      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
    </div>
  );
};

export default Page4_TargetPainpoint;