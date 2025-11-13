// src/pages/Page5_TargetStage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page3_Target-User.module.css';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/页面剩余素材/Page345页面.svg';
import { useDesign } from '../context/DesignContext'; 

// 为 Page5 创建一个专门的 API 调用函数
const getAiResponseForStage = async (userInput, currentMessages) => {
  console.log("1. [FRONTEND-P5] 开始调用 getAiResponseForStage 函数...");

  // 消息历史处理：将当前用户输入添加到消息列表
  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));
  messagesForApi.push({ role: 'user', content: userInput });

  // 关键修改：将 task 设置为 'getTargetStage'
  const requestBody = {
    messages: messagesForApi,
    task: 'getTargetStage' 
  };

  console.log("2. [FRONTEND-P5] 准备发送到 /api/chat 的请求体:", JSON.stringify(requestBody, null, 2));

  try {
    // API 请求部分保持不变
    const response = await fetch('/api/chat', {
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
    
    // 返回完整的响应对象，包括 isTaskComplete
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


const Page5_TargetStage = () => {
  const navigate = useNavigate();
  const { updateDesignData } = useDesign(); 
  const [isTaskComplete, setIsTaskComplete] = useState(false); // 初始值应为 false

  // MODIFICATION START: 实现 handleTaskComplete
  const handleTaskComplete = (data) => {
    console.log("P5 任务完成，准备跳转。提取到的数据:", data);
    
    // 1. 更新全局状态 (使用后端返回的 targetStage 字段)
    if (data && data.targetStage) {
      updateDesignData('targetStage', data.targetStage);
      setIsTaskComplete(true); // 标记任务完成，启用按钮
    }

    // 2. 延迟跳转，给用户阅读反馈的时间
    setTimeout(() => {
      navigate('/page6'); // 跳转到下一页 Page6
    }, 1500); // 延迟1.5秒
  };
  // MODIFICATION END
  
  // 备用跳转函数
  const handleNext = () => {
    navigate('/user-select-1'); // 假设 Page6 的路由是 /user-select-1
  };

  // 初始消息：需要向用户介绍三个阶段
  const initialBotMessage = `接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。我这里有三个阶段供你参考：
  1. 意识提升阶段 - 让用户开始意识到健康问题的重要性。
  2. 行为促进阶段 - 推动用户开始采取具体健康行为。
  3. 行为增强阶段 - 帮助用户维持并强化健康行为。
  你觉得你的设计想聚焦在哪个阶段呢？可以和我聊聊你的想法。`;


  return (
    <div className={styles.pageContainer}
    style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <BranchSelector />

      <div className={styles.mainContent}>

        {/* MODIFICATION START: 更新气泡标题和提示词以匹配需求文档 Page 4 */}
        <div className={styles.titleBubble}>
          <p style={{ fontWeight: 'bold' }}>让我们一起确定你的设计目标吧!</p>
          <p>接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。我这里有三个阶段供你参考:意识提升阶段、行为促进阶段、行为增强阶段。你觉得你的设计想聚焦在哪个阶段呢?可以和我聊聊你的想法。</p>
        </div>
        {/* MODIFICATION END */}

        {/* 聊天框容器 */}
        <div className={styles.chatWrapper}>
          <ChatDialog 
            // MODIFICATION: 统一属性名为 getAiResponse
            getAiResponse={getAiResponseForStage}
            // MODIFICATION: 传入新的回调函数
            onTaskComplete={handleTaskComplete}
            initialBotMessage={initialBotMessage}
          />
        </div>
      </div>
      
      {/* 按钮现在由 handleTaskComplete 自动触发跳转，这里作为备用 */}
      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
    </div>
  );
};

export default Page5_TargetStage;