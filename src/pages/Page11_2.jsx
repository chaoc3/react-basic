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
import { ReactComponent as ArrowLeft } from '../assets/网页素材/向左.svg';
import { ReactComponent as ArrowRight } from '../assets/网页素材/向右.svg';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg';

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
  const [currentIndex, setCurrentIndex] = useState(0); // 状态保持不变

  const selectedCards = useMemo(() => 
    allCards.filter(card => designData.mechanismCards?.includes(card.name)), 
    [designData.mechanismCards]
  );
  
  // currentCard 的逻辑保持不变
  const currentCard = selectedCards[currentIndex];

  // --- 新增：从 Page6 引入的轮播逻辑 ---
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? selectedCards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === selectedCards.length - 1 ? 0 : prev + 1));

  const getCardClass = (index) => {
    const classes = [styles.card];
    const prevIndex = currentIndex === 0 ? selectedCards.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === selectedCards.length - 1 ? 0 : currentIndex + 1;

    if (index === currentIndex) {
      classes.push(styles.active);
    } else if (index === prevIndex) {
      classes.push(styles.prev);
    } else if (index === nextIndex) {
      classes.push(styles.next);
    } else {
      classes.push(styles.hidden);
    }
    
    // Page11 不需要点击选中效果，所以不添加 .selected 类
    return classes.join(' ');
  };
  // --- 轮播逻辑结束 ---


  const mergeMechanismDetails = useCallback((details) => {
    if (!details) return;
    const cardName = currentCard?.name;
    if (!cardName) {
      updateDesignData('mechanismDetails', details);
      return;
    }
    const isAlreadyKeyed = details[cardName];
    const normalized = isAlreadyKeyed ? details : { [cardName]: details };
    updateDesignData('mechanismDetails', normalized);
  }, [currentCard, updateDesignData]);

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
    if (selectedCards.length > 0) {
      // 确保 currentCard 已经基于 currentIndex 更新
      const currentCardName = selectedCards[currentIndex]?.name;
      if (!currentCardName) return;

      const aiResult = await getAiResponse(
        [], 
        'buildMechanismDetails',
        { 
          mechanismCards: designData.mechanismCards,
          mechanismDetails: designData.mechanismDetails,
          currentCardName: currentCardName, 
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
      console.warn("No selected mechanism cards found, redirecting to /page10.");
      navigate('/page10');
    }
  }, [selectedCards, currentIndex, designData, navigate, mergeMechanismDetails, handleTaskComplete]); // 依赖项中加入 currentIndex

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
        currentCardName: currentCard?.name,
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
    if (!currentCard?.name) return {};
    return designData.mechanismDetails?.[currentCard.name] || {};
  }, [designData.mechanismDetails, currentCard]);

  if (selectedCards.length === 0) return null;

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
        {/* --- 使用新的 JSX 结构替换 Slider --- */}
        <div className={styles.cardCarousel}>
          <button onClick={handlePrev} className={styles.arrowButton}><ArrowLeft /></button>
          <div className={styles.cardContainer}>
            {selectedCards.map((card, index) => (
              <div
                key={card.id}
                className={getCardClass(index)}
              >
                <OverlayCard 
                    backgroundImageUrl={card.image}
                    // 只有当前显示的卡片才叠加信息
                    fields={card.name === currentCard.name ? mechanismFields : []} 
                />
              </div>
            ))}
          </div>
          <button onClick={handleNext} className={styles.arrowButton}><ArrowRight /></button>
        </div>
        {/* --- 结构替换结束 --- */}
        <button className={styles.nextButton} onClick={handleNextPage} disabled={!isTaskComplete}>
          <NextButtonSVG />
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