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

// --- Main Component ---
const Page11_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析机制策略，请稍候...");

  // 查找当前选中的卡片（单个展示，不再使用轮播）
  const selectedCard = allCards.find(card => card.name === designData.mechanismCards);


  const mergeMechanismDetails = useCallback((details) => {
    if (!details) return;
    const cardName = selectedCard?.name;
    if (!cardName) {
      updateDesignData('mechanismDetails', details);
      return;
    }
    const isAlreadyKeyed = details[cardName];
    const normalized = isAlreadyKeyed ? details : { [cardName]: details };
    updateDesignData('mechanismDetails', normalized);
  }, [selectedCard, updateDesignData]);

  const handleNextPage = useCallback(() => {
    completeStage(CURRENT_STAGE_ID); 
    navigate('/page12');
  }, [completeStage, navigate]);

  const handleTaskComplete = useCallback((data) => {
    if (data?.mechanismDetails) {
      mergeMechanismDetails(data.mechanismDetails);
    }
    if (data?.isTaskComplete) {
      setIsTaskComplete(true);
      setTimeout(() => handleNextPage(), 1500);
    }
  }, [mergeMechanismDetails, handleNextPage]);

  const startStrategyBuilding = useCallback(async () => {
    if (selectedCard) {
      const aiResult = await getAiResponse(
        [], 
        'buildMechanismDetails',
        { 
          mechanismCards: designData.mechanismCards,
          mechanismDetails: designData.mechanismDetails,
          currentCardName: selectedCard.name, 
          targetUser: designData.targetUser,
          targetStage: designData.targetStage,
        }
      );
      setInitialBotMessage(aiResult.responseText);
      if (aiResult.extractedData?.mechanismDetails) {
        mergeMechanismDetails(aiResult.extractedData.mechanismDetails);
      }
      if (aiResult.isTaskComplete) handleTaskComplete(aiResult);
    } else {
      console.warn("No selected mechanism card found, redirecting to /page10.");
      navigate('/page10');
    }
  }, [selectedCard, designData, navigate, mergeMechanismDetails, handleTaskComplete]);

  useEffect(() => {
    setActiveStageId(CURRENT_STAGE_ID);
    startStrategyBuilding();
  }, [setActiveStageId, startStrategyBuilding]);

  // handleSendMessage, handleDataExtracted, handleTaskComplete, handleNextPage 逻辑完全保持不变
  const handleSendMessage = async (userInput, currentMessages) => {
    const messagesForApi = [...currentMessages, { sender: 'user', text: userInput }];
    return await getAiResponse(
      messagesForApi,
      'buildMechanismDetails', 
      { 
        mechanismCards: designData.mechanismCards,
        mechanismDetails: designData.mechanismDetails,
        currentCardName: selectedCard?.name,
        targetUser: designData.targetUser,
        targetStage: designData.targetStage,
      }
    );
  };

  const handleDataExtracted = (data) => {
    if (data?.mechanismDetails) {
      mergeMechanismDetails(data.mechanismDetails);
    }
  };

  const currentMechanismDetails = useMemo(() => {
    if (!selectedCard?.name) return {};
    return designData.mechanismDetails?.[selectedCard.name] || {};
  }, [designData.mechanismDetails, selectedCard]);

  if (!selectedCard) return null;

  const mechanismFields = [
    { label: `策略 1`, value: currentMechanismDetails?.strategy1 ?? '', placeholder: `待补充...` },
    { label: `策略 2`, value: currentMechanismDetails?.strategy2 ?? '', placeholder: `待补充...` },
    { label: `策略 3`, value: currentMechanismDetails?.strategy3 ?? '', placeholder: `待补充...` },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          {/* 渲染卡片背面 PNG */}
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