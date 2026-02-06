// src/pages/Page1617_add.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page3_Target-User.module.css';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/背景带文字/增加页面-剩余3个阶段方案.png';
import { useDesign } from '../context/DesignContext'; 

// --- 修改 1: 接收 designData 参数 ---
const getAiResponseForRemainingStages = async (userInput, currentMessages, designData) => {
  console.log("1. [FRONTEND-Add] 开始调用 API...");

  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));

  const requestBody = {
    messages: messagesForApi,
    task: 'completeRemainingStages', // --- 修改 2: 更新任务名称 ---
    
    // --- 修改 3: 传递所有必要的数据给后端 ---
    targetStage: designData.targetStage,
    // 传递用于生成摘要的数据
    scenarioCard: designData.scenarioCard,
    scenarioDetails: designData.scenarioDetails,
    mechanismCards: designData.mechanismCards,
    mechanismDetails: designData.mechanismDetails,
    infoSourceCards: designData.infoSourceCards,
    modeCard: designData.modeCard,
    // 传递当前已补全的进度 (用于轮询)
    fullStagePlans: designData.fullStagePlans 
  };

  console.log("2. [FRONTEND-Add] 请求体:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data;

  } catch (error) {
    console.error("API Error:", error);
    return { 
      responseText: "网络连接异常，请稍后再试。", 
      extractedData: null,
      isTaskComplete: false,
    };
  }
};

const Page1617_add = () => {
  const navigate = useNavigate();
  const { designData, updateDesignData } = useDesign(); // 获取 designData
  const [isTaskComplete, setIsTaskComplete] = useState(false); 

  // --- 修改 4: 包装 API 调用 ---
  const fetchAi = (input, msgs) => getAiResponseForRemainingStages(input, msgs, designData);

  const handleTaskComplete = (data) => {
    console.log("任务完成，收到数据:", data);
    
    // --- 修改 5: 保存补全后的方案数据 ---
    if (data && data.fullStagePlans) {
      updateDesignData('fullStagePlans', data.fullStagePlans);
    }

    // 检查是否全部完成
    if (data && data.isTaskComplete) {
      setIsTaskComplete(true); 
      setTimeout(() => {
        navigate('/page17'); // 跳转到下一页
      }, 1500); 
    }
  };
  
  const handleNext = () => {
    navigate('/Page1617_add'); 
  };

  // --- 修改 6: 更新初始提示词 ---
  // 这里不需要太长，因为 Prompt 会根据 designData 生成第一句引导
  // 但为了用户体验，我们可以给一个通用的开场
  const initialBotMessage = `太棒了，我们已经完成了“${designData.targetStage || '当前阶段'}”的详细设计。
为了让整个方案更完整，接下来我将协助你快速补全其余三个阶段的方案。
我们会保持逻辑的连贯性。准备好了吗？我们先从下一个阶段开始。`;

  return (
    <div className={styles.pageContainer}
    style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <BranchSelector />

      <div className={styles.mainContent}>
        <div className={styles.chatWrapper}>
          <ChatDialog 
            getAiResponse={fetchAi} // 使用新的 fetchAi
            onTaskComplete={handleTaskComplete}
            initialBotMessage={initialBotMessage}
          />
        </div>
      </div>
      
      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
    </div>
  );
};

export default Page1617_add;