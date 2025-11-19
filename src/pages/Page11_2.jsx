// src/pages/Page11_2.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// 移除 react-slick 相关导入
// import Slider from "react-slick"; 
// import "slick-carousel/slick/slick.css"; 
// import "slick-carousel/slick/slick-theme.css";

// Context and Services
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService'; 

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import OverlayCard from '../components/OverlayCard';

// Asset Imports
import Mec1 from '../assets/卡片背面/Mec-1-2.png';
import Mec2 from '../assets/卡片背面/Mec-2-2.png';
import Mec3 from '../assets/卡片背面/Mec-3-2.png';
import Mec4 from '../assets/卡片背面/Mec-4-2.png';
import Mec5 from '../assets/卡片背面/Mec-5-2.png';
import Mec6 from '../assets/卡片背面/Mec-6-2.png';
import Mec7 from '../assets/卡片背面/Mec-7-2.png';
import Mec8 from '../assets/卡片背面/Mec-8-2.png';
import NextButtonSVG from '../assets/页面剩余素材/Next按钮.svg';

// Styles
import styles from './styles/Page11_Mec_2.module.css';

// --- Data Definitions ---
const CURRENT_STAGE_ID = 4;
const allCards = [
  { id: 1, image: Mec1, name: '情景感知提醒'  },
  { id: 2, image: Mec2, name: '反馈与激励' },
  { id: 3, image: Mec3, name: '决策简化' },
  { id: 4, image: Mec4, name: '社会影响' },
  { id: 5, image: Mec5, name: '认知重建与反思'},
  { id: 6, image: Mec6, name: '目标设定' },
  { id: 7, image: Mec7, name: '激发好奇心' },
  { id: 8, image: Mec8, name: '诱饵效应' },
];

const Page11_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析机制策略，请稍候...");

  const selectedCard = allCards.find(card => card.name === designData.mechanismCards);
  
  // --- 核心修改：直接从 designData 读取扁平对象 ---
  const currentMechanismDetails = designData.mechanismDetails || {};

  const handleNextPage = useCallback(() => {
    completeStage(CURRENT_STAGE_ID); 
    navigate('/page12');
  }, [completeStage, navigate]);

  // 任务完成时的回调
  const handleTaskComplete = useCallback((data) => {
    console.log("AI has confirmed: mechanism details task is complete.");
    // 即使任务完成，也可能返回最终的数据，我们需要更新它
    if (data?.mechanismDetails) {
        // 这里的 data.mechanismDetails 是一个完整的扁平对象
        // DesignContext 会执行合并，但因为后端返回的是完整对象，所以结果是正确的
        updateDesignData('mechanismDetails', data.mechanismDetails);
    }
    setIsTaskComplete(true);
    
    setTimeout(() => {
        handleNextPage();
    }, 1500);
  }, [updateDesignData, handleNextPage]);

  // 页面加载时启动对话
  const startStrategyBuilding = useCallback(async () => {
    if (selectedCard) {
      const aiResult = await getAiResponse(
        [], 
        'buildMechanismDetails',
        { 
          // 发送扁平的 mechanismDetails
          mechanismDetails: designData.mechanismDetails,
          // 仍然发送 currentCardName 作为上下文
          currentCardName: selectedCard.name,
          // 其他上下文...
          targetUser: designData.targetUser,
          targetStage: designData.targetStage,
        }
      );
      
      setInitialBotMessage(aiResult.responseText);
      
      if (aiResult.extractedData?.mechanismDetails) {
        // 后端返回的是完整的扁平对象，直接更新
        updateDesignData('mechanismDetails', aiResult.extractedData.mechanismDetails);
      }
      if (aiResult.isTaskComplete) {
        // 调用 handleTaskComplete 来处理跳转等逻辑
        handleTaskComplete(aiResult.extractedData);
      }
    } else {
      console.warn("No selected mechanism card found, redirecting to /page10.");
      navigate('/page10');
    }
  }, [designData, selectedCard, navigate, updateDesignData, handleTaskComplete]);

  useEffect(() => {
    setActiveStageId(CURRENT_STAGE_ID);
    startStrategyBuilding();
  }, [setActiveStageId, startStrategyBuilding]);

  // 发送用户消息
  const handleSendMessage = async (userInput, currentMessages) => {
    const messagesForApi = [...currentMessages, { sender: 'user', text: userInput }];
    return await getAiResponse(
      messagesForApi,
      'buildMechanismDetails', 
      { 
        mechanismDetails: designData.mechanismDetails,
        currentCardName: selectedCard?.name,
        targetUser: designData.targetUser,
        targetStage: designData.targetStage,
      }
    );
  };

  // 提取到新数据时的回调
  const handleDataExtracted = (data) => {
    if (data?.mechanismDetails) {
      console.log("Extracted new mechanism details:", data.mechanismDetails);
      // 后端返回的是完整的扁平对象，直接更新
      updateDesignData('mechanismDetails', data.mechanismDetails);
    }
  };

  if (!selectedCard) return null;

  const mechanismFields = [
    { label: `策略 1`, value: String(currentMechanismDetails?.strategy1 ?? ''), placeholder: `待补充...` },
    { label: `策略 2`, value: String(currentMechanismDetails?.strategy2 ?? ''), placeholder: `待补充...` },
    { label: `策略 3`, value: String(currentMechanismDetails?.strategy3 ?? ''), placeholder: `待补充...` },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          <OverlayCard 
            backgroundImageUrl={selectedCard.image}
            fields={mechanismFields}
          />
        </div>
        <button className={styles.nextButton} onClick={handleNextPage} disabled={!isTaskComplete}>
          <img src={NextButtonSVG} alt="下一步" />
        </button>
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog 
          key={initialBotMessage}
          initialBotMessage={initialBotMessage} 
          getAiResponse={handleSendMessage} 
          onDataExtracted={handleDataExtracted}
          onTaskComplete={handleTaskComplete}
        />
      </div>
    </div>
  );
};

export default Page11_2;