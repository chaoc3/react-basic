// src/pages/Page5_TargetStage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page_look.module.css';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/背景带文字/角色页面.png';
import { useDesign } from '../context/DesignContext'; 
import InfoButtonIcon  from '../assets/网页素材/设计策略按钮.png'; // 1. 打开弹窗的按钮图
import InfoContentImg  from '../assets/网页素材/形象.png'; // 2. 弹窗里显示的长图
import CloseIcon  from '../assets/页面剩余素材/总结页面关闭按钮.png'; // 3. 关闭按钮图
// 为 Page5 创建一个专门的 API 调用函数
const getAiResponseForCharacter = async (userInput, currentMessages, designData) => {
  console.log("1. [FRONTEND-Character] 开始调用 getAiResponseForCharacter 函数...");

  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));

  // 构建请求体
  const requestBody = {
    messages: messagesForApi,
    task: 'buildCharacterProfile', // 任务名称对应后端配置
    // 关键：将当前的角色数据传给后端，以便后端判断还需要问什么（轮询逻辑）
    characterProfile: designData.characterProfile 
  };

  console.log("2. [FRONTEND-Character] 准备发送请求:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("4. [FRONTEND-Character] 成功解析 JSON:", data);
    
    return data;

  } catch (error) {
    console.error("5. [FRONTEND-Character] 错误:", error);
    return { 
      responseText: "抱歉，网络连接或服务器似乎出了点问题，请稍后再试。", 
      extractedData: null,
      isTaskComplete: false,
    };
  }
};


const Page_Character = () => {
  const navigate = useNavigate();
  // --- 修改 2: 获取 designData ---
  const { designData, updateDesignData } = useDesign(); 
  const [isTaskComplete, setIsTaskComplete] = useState(false); 
  const [showInfoModal, setShowInfoModal] = useState(false);

  // --- 修改 3: 包装 API 调用以传递 designData ---
  const fetchAi = (input, msgs) => getAiResponseForCharacter(input, msgs, designData);

  const handleTaskComplete = (data) => {
     console.log("Character 页面收到 TaskComplete 回调, 数据内容:", data);
  
  // 1. 保存已有的进度
    if (data && data.characterProfile) {
      updateDesignData('characterProfile', data.characterProfile);
    }

    // 2. 核心修复：既然 ChatDialog 已经判断过 isTaskComplete 才调用的此函数，
    // 我们直接设置状态为 true，不再检查 data.isTaskComplete
    console.log("确认任务完成，激活下一步按钮并准备跳转...");
    setIsTaskComplete(true); 

    // 3. 自动跳转逻辑
    setTimeout(() => {
      navigate('/page_look'); 
    }, 2000); 
  };
  
  const handleNext = () => {
    navigate('/page_look'); 
  };

  // --- 修改 5: 设置角色共创的初始开场白 ---
  const initialBotMessage = `我是你的“智能代理角色共创助手”。
为了打造最适合你的智能代理，我们先来确定它的角色定位。
你希望它更像：
1. **专业顾问**（理性、权威）
2. **伙伴陪伴**（亲和、平等）
3. **教练督促**（严格、目标导向）
也允许“混合比例”（例如 70%伙伴 + 30%顾问）。请告诉我你的想法。`;

  return (
    <div className={styles.pageContainer}
    style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <BranchSelector />

      <div className={styles.mainContent}>
        <button 
          className={styles.infoTriggerButton} 
          onClick={() => setShowInfoModal(true)}
        >
          <img src={InfoButtonIcon} alt="查看详情" />
        </button>

        <div className={styles.chatWrapper}>
          <ChatDialog 
            getAiResponse={fetchAi} // 使用包装后的函数
            onTaskComplete={handleTaskComplete}
            initialBotMessage={initialBotMessage}
          />
        </div>
      </div>
      
      {/* 只有任务完成后才建议允许点击下一步，或者保持一直可点 */}
      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
      
      {showInfoModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentWrapper}>
            <button 
              className={styles.closeModalButton} 
              onClick={() => setShowInfoModal(false)}
            >
              <img src={CloseIcon} alt="关闭" />
            </button>
            
            <div className={styles.scrollableContent}>
              <img src={InfoContentImg} alt="详细信息" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page_Character;