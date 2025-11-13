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

// MODIFICATION START: 更新 getAiResponse 以处理新的后端响应
const getAiResponse = async (userInput, currentMessages) => {
  console.log("1. [FRONTEND] 开始调用 getAiResponse 函数...");

  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));
  // 注意：根据 Vercel AI SDK 的标准，通常不需要将当前用户输入再次添加到数组中
  // 但如果你的 ChatDialog 组件没有这样做，这里的 push 就是必要的
  // messagesForApi.push({ role: 'user', content: userInput });

  const requestBody = {
    messages: messagesForApi,
    task: 'getTargetUser' // 明确告知后端当前任务
  };

  console.log("2. [FRONTEND] 准备发送到 /api/chat 的请求体:", JSON.stringify(requestBody, null, 2));

  try {
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
    console.log("4. [FRONTEND] 成功解析后端的 JSON 数据:", data);
    
    // 返回完整的响应对象
    return data;

  } catch (error) {
    console.error("5. [FRONTEND] 在 fetch 或解析 JSON 时捕获到严重错误:", error);
    return {
      responseText: "抱歉，网络连接或服务器似乎出了点问题，请稍后再试。",
      extractedData: null,
      isTaskComplete: false, // 出错时任务肯定未完成
    };
  }
};
// MODIFICATION END


const Page3_TargetUser = () => {
  const navigate = useNavigate();
  const { updateDesignData } = useDesign();
  
  const [isSumOpen, setIsSumOpen] = useState(false);
  const [sumEntryPoint, setSumEntryPoint] = useState('');

  // MODIFICATION START: 添加处理任务完成的函数
  const handleTaskComplete = (data) => {
    console.log("任务完成，准备跳转。提取到的数据:", data);
    
    // 1. 更新全局状态
    if (data && data.targetUser) {
      updateDesignData('targetUser', data.targetUser);
    }

    // 2. 延迟跳转，给用户阅读反馈的时间
    setTimeout(() => {
      navigate('/target-painpoint'); // 跳转到下一页
    }, 1500); // 延迟1.5秒
  };
  // MODIFICATION END
  
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

  // 这个手动下一页的按钮仍然可以保留，作为AI无法正确识别时的备用方案
  const handleNext = () => {
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
            getAiResponse={getAiResponse} // MODIFICATION: 更改了 prop 名称以匹配函数
            onTaskComplete={handleTaskComplete} // MODIFICATION: 传入新的回调函数
          />
        </div>
      </div>

      {/* 这个按钮现在是备用方案 */}
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