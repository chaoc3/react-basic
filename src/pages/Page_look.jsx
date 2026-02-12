// src/pages/Page_Look.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page_look.module.css'; // 复用样式
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/背景带文字/Page3-Target-User.svg'; // 请确认背景图路径是否需要修改
import { useDesign } from '../context/DesignContext'; 

// 引入弹窗素材 (请确保路径与 Page 5 一致或指向正确文件)
import InfoButtonIcon  from '../assets/网页素材/设计策略按钮.png'; 
import InfoContentImg  from '../assets/网页素材/角色.png'; // 如果形象页有不同的说明图，请替换这里
import CloseIcon  from '../assets/页面剩余素材/总结页面关闭按钮.png'; 

// --- 1. 专门为 Look 页面定义的 API 调用函数 ---
const getAiResponseForLook = async (userInput, currentMessages, designData) => {
  console.log("1. [FRONTEND-Look] 开始调用 getAiResponseForLook...");

  const messagesForApi = currentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));

  // 构建请求体
  const requestBody = {
    messages: messagesForApi,
    task: 'buildLookProfile', // 任务名称对应后端配置
    // 关键：将当前的形象数据传给后端，以便后端判断还需要问什么
    lookProfile: designData.lookProfile 
  };

  console.log("2. [FRONTEND-Look] 准备发送请求:", JSON.stringify(requestBody, null, 2));

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
    console.log("4. [FRONTEND-Look] 成功解析 JSON:", data);
    
    return data;

  } catch (error) {
    console.error("5. [FRONTEND-Look] 错误:", error);
    return { 
      responseText: "抱歉，网络连接或服务器似乎出了点问题，请稍后再试。", 
      extractedData: null,
      isTaskComplete: false,
    };
  }
};

const Page_look = () => {
  const navigate = useNavigate();
  const { designData, updateDesignData } = useDesign(); 
  const [isTaskComplete, setIsTaskComplete] = useState(false); 
  const [showInfoModal, setShowInfoModal] = useState(false);

  // --- 2. 包装 API 调用以传递 designData ---
  const fetchAi = (input, msgs) => getAiResponseForLook(input, msgs, designData);

  // --- 3. 处理任务完成逻辑 (核心修改) ---
  const handleTaskComplete = (data) => {
    console.log("Look 收到数据:", data);

    // 步骤 A: 无论是否完成，先保存已提取的数据
    if (data && data.lookProfile) {
      updateDesignData('lookProfile', data.lookProfile);
    }

    // 步骤 B: 检查后端返回的完成标志 (isTaskComplete)
    // 只有当 imageStyle, anthropomorphism, creationMethod, consistency, expression 全都有值时
    // 后端才会返回 true
    
      console.log("任务状态：已完成，准备自动跳转");
      setIsTaskComplete(true); 
      
      // 延迟自动跳转 (提升体验)
      setTimeout(() => {
        navigate('/page12'); // 跳转到下一页 (请修改为你实际的下一页路径)
      }, 1500);

  };
  
  // --- 4. 手动点击下一步按钮的处理 ---
  const handleNext = () => {
    // 如果你希望强制用户完成任务才能跳，取消下面注释：
    /*
    if (!isTaskComplete) {
      alert("请先配合 AI 完成形象设定的所有问题。");
      return;
    }
    */
    navigate('/page12'); // 跳转到下一页
  };

  // --- 5. 形象共创的初始开场白 ---
  const initialBotMessage = `我是“智能代理形象共创助手”。
设计完内在，我们来设计外在形象。
首先，请选择一个**形象路线**：
A. **轻形象**（名字 + 抽象符号/简单头像）
B. **具体形象**（具体的角色头像/虚拟人形象）
C. **无固定形象**（以语音人格为主，视觉弱化）
你倾向于哪一种？`;

  return (
    <div className={styles.pageContainer}
    style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <BranchSelector />

      <div className={styles.mainContent}>
        {/* 详情弹窗触发按钮 */}
        <button 
          className={styles.infoTriggerButton} 
          onClick={() => setShowInfoModal(true)}
        >
          <img src={InfoButtonIcon} alt="查看详情" />
        </button>

        <div className={styles.chatWrapper}>
          <ChatDialog 
            getAiResponse={fetchAi} 
            onTaskComplete={handleTaskComplete}
            initialBotMessage={initialBotMessage}
          />
        </div>
      </div>
      
      {/* 下一步按钮：移除了 disabled，使其始终可点 */}
      <ArrowButton onClick={handleNext} />
      
      {/* 弹窗遮罩层 */}
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

export default Page_look;