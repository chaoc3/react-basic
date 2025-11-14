// src/pages/Page12_InfS_1.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext'; 

// SVG Asset Imports (卡片正面)
import { ReactComponent as CardInfS1 } from '../assets/卡片 - svg/卡片正面-选择页/InfS-1-1.svg';
import { ReactComponent as CardInfS2 } from '../assets/卡片 - svg/卡片正面-选择页/InfS-2-1.svg';
import { ReactComponent as CardInfS3 } from '../assets/卡片 - svg/卡片正面-选择页/InfS-3-1.svg';
import { ReactComponent as ArrowLeft } from '../assets/网页素材/向左.svg';
import { ReactComponent as ArrowRight } from '../assets/网页素材/向右.svg';
import { ReactComponent as SelectButtonSVG } from '../assets/页面剩余素材/Page68101214按钮.svg';

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page12_InfS_1.module.css'; 

// 场景卡片数据
const cards = [
  { id: 1, component: <CardInfS1 />, name: '自我数据' },
  { id: 2, component: <CardInfS2 />, name: '他人影响' },
  { id: 3, component: <CardInfS3 />, name: '专家干预' },
];

const Page12_1 = () => {
  
  const navigate = useNavigate();
  const { setActiveStageId, setSingleCard, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  // MODIFICATION 1: 状态改为数组，支持多选
  const [selectedCardIds, setSelectedCardIds] = useState([]); 
  const [initialBotMessage, setInitialBotMessage] = useState("正在思考如何为你推荐信息源..."); 
  
  useEffect(() => {
    setActiveStageId(5); // Page 12 对应 Stage 5
    // 模拟 AI 推荐，基于 Target-Stage 和 Mec 字段
    if (designData.targetStage && designData.mechanismCards.length > 0) {
        setInitialBotMessage(`根据你选择的机制和目标，我为你推荐了几个信息源。请在左侧选择至少一个卡片。`);
    } else {
        setInitialBotMessage("请先完成前面的步骤，然后选择至少一个信息源卡片。");
    }
  }, [setActiveStageId, designData.targetStage, designData.mechanismCards]);

  // --- 2. UI 交互逻辑 (多选) ---
  const handleCardClick = (cardId) => {
    // 切换选中状态
    setSelectedCardIds(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId) 
        : [...prev, cardId]
    );
    // Timeline 只记录第一个选中的卡片
    setSingleCard(5, cardId); 
  };

  const handleNextPage = () => {
    if (selectedCardIds.length > 0) {
      // 关键：保存选中的信息源名称数组到 Context
      const selectedNames = cards
        .filter(c => selectedCardIds.includes(c.id))
        .map(c => c.name);
      
      updateDesignData('infoSourceCards', selectedNames);
      
      completeStage(5);
      navigate('/page13'); // 跳转到 Page 13
    }
  };

  // 轮播和类名逻辑 (与 Page 6 相同)
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  
  const getCardClass = (index) => {
    const classes = [styles.card];
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;

    if (index === currentIndex) {
      classes.push(styles.active);
    } else if (index === prevIndex) {
      classes.push(styles.prev);
    } else if (index === nextIndex) {
      classes.push(styles.next);
    } else {
      classes.push(styles.hidden);
    }
    
    // Add 'selected' class if the card is the chosen one
    if (selectedCardIds === cards[index].id) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  // --- 3. Dummy AI 函数 ---
  const dummyGetAiResponse = async (input) => ({ responseText: "请在左侧选择至少一张卡片后点击下方的按钮继续。" });

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardCarousel}>
          <button onClick={handlePrev} className={styles.arrowButton}><ArrowLeft /></button>
          <div className={styles.cardContainer}>
            {cards.map((card, index) => (
                <div
                key={card.id}
                className={getCardClass(index)}
                onClick={() => handleCardClick(card.id)}
              >
                {card.component}
              </div>
            ))}
          </div>
          <button onClick={handleNext} className={styles.arrowButton}><ArrowRight /></button>
        </div>
        <button className={styles.selectButton} onClick={handleNextPage}
        disabled={selectedCardIds.length === 0}>
          <SelectButtonSVG />
        </button>
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog
          key={initialBotMessage}
          initialBotMessage={initialBotMessage}
          getAiResponse={dummyGetAiResponse}
        />
      </div>
    </div>
  );
};

export default Page12_1;