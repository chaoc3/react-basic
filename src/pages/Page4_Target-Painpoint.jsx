// src/pages/Page4_TargetPainpoint.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from './styles/Page3_Target-User.module.css'; 
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/页面剩余素材/Page345页面.svg';
import { useDesign } from '../context/DesignContext'; 

// 为 Page4 创建一个专门的 API 调用函数
const getAiResponseForPainpoint = async (userInput, currentMessages) => {
  console.log("1. [FRONTEND-P4] 开始调用 getAiResponseForPainpoint...");

  // 消息历史处理：将当前用户输入添加到消息列表
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
      console.error(`API 请求失败，状态码: ${response.status}, 响应内容: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("4. [FRONTEND-P4] 成功解析 JSON:", data);
    
    // 返回完整的响应对象，包括 isTaskComplete
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

  // MODIFICATION START: 实现 handleTaskComplete
  const handleTaskComplete = (data) => {
    console.log("P4 任务完成，准备跳转。提取到的数据:", data);
    
    // 1. 更新全局状态 (使用后端返回的 targetPainpoint 字段)
    if (data && data.targetPainpoint) {
      updateDesignData('targetPainpoint', data.targetPainpoint);
      setIsTaskComplete(true); // 标记任务完成，启用按钮
    }

    // 2. 延迟跳转，给用户阅读反馈的时间
    setTimeout(() => {
      navigate('/target-stage'); // 跳转到下一页 Page5
    }, 1500); // 延迟1.5秒
  };
  // MODIFICATION END
  
  // 备用跳转函数
  const handleNext = () => {
    navigate('/target-stage'); 
  };

  return (
    <div className={styles.pageContainer} style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <BranchSelector />
      <div className={styles.mainContent}>
        {/* MODIFICATION START: 更新气泡标题和提示词以匹配需求文档 Page 3 */}
        <div className={styles.titleBubble}>
          <p style={{ fontWeight: 'bold' }}>让我们一起确定你的设计目标吧!</p>
          <p>你希望这个智能代理去改变的健康问题是什么？可以用一句话告诉我你的设计发现或痛点。</p>
        </div>
        {/* MODIFICATION END */}
        <div className={styles.chatWrapper}>
          <ChatDialog 
            // MODIFICATION: 统一属性名为 getAiResponse
            getAiResponse={getAiResponseForPainpoint} 
            // MODIFICATION: 传入新的回调函数
            onTaskComplete={handleTaskComplete} 
            // 初始消息应与气泡中的第二个 p 标签一致
            initialBotMessage="你希望这个智能代理协助的助推机制想改变的问题是什么？"
          />
        </div>
      </div>
      {/* 按钮现在由 handleTaskComplete 自动触发跳转，这里作为备用 */}
      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
    </div>
  );
};

export default Page4_TargetPainpoint;