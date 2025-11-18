// src/pages/Page14_Mod_1.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext'; 

// PNG Asset Imports (卡片正面，作为图片 URL)
import CardMod1 from '../assets/卡片/正面/Mod-1-1.png';
import CardMod2 from '../assets/卡片/正面/Mod-2-1.png';
import CardMod3 from '../assets/卡片/正面/Mod-3-1.png';
import CardMod4 from '../assets/卡片/正面/Mod-4-1.png';
import ArrowLeft from '../assets/网页素材/向左.svg';
import ArrowRight from '../assets/网页素材/向右.svg';
import SelectButtonSVG from '../assets/页面剩余素材/Page68101214按钮.svg';

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page14_Mod_1.module.css';

const cards = [
  { id: 1, src: CardMod1, name: '文本交互' },
  { id: 2, src: CardMod2, name: '语言交互' },
  { id: 3, src: CardMod3, name: '视觉交互' },
  { id: 4, src: CardMod4, name: '多模态交互'}
];

const Page14_User_1 = () => {
  
  const navigate = useNavigate();
  const { setActiveStageId, setSingleCard, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  // MODIFICATION 1: 状态改回单选 (null 或 number)
  const [selectedCardId, setSelectedCardId] = useState(null); 
  const [initialBotMessage, setInitialBotMessage] = useState("正在思考如何为你推荐交互模态..."); 

  useEffect(() => {
    setActiveStageId(6); // Page 14 对应 Stage 6
    // 模拟 AI 推荐，基于 Mec 和 InfS 字段
    if (designData.mechanismCards.length > 0 && designData.infoSourceCards.length > 0) {
        setInitialBotMessage(`根据你选择的机制和信息源，我为你推荐了一个最契合的交互模态。请在左侧选择一个。`);
    } else {
        setInitialBotMessage("请先完成前面的步骤，然后选择一个交互模态卡片。");
    }
  }, [setActiveStageId, designData.mechanismCards, designData.infoSourceCards]);

  // --- 2. UI 交互逻辑 (单选) ---
  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    setSingleCard(6, cardId); 
  };

  const handleNextPage = () => {
    if (selectedCardId) {
      const selectedCardName = cards.find(c => c.id === selectedCardId)?.name;
      
      // 关键：保存选中的模态名称到 Context
      if (selectedCardName) {
        updateDesignData('modeCard', selectedCardName);
      }
      
      completeStage(6);
      navigate('/page15'); // 跳转到 Page 15
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
    if (selectedCardId === cards[index].id) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  // --- 3. Dummy AI 函数 ---
  const dummyGetAiResponse = async (input) => ({ responseText: "请在左侧选择卡片后点击下方的按钮继续。" });

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardCarousel}>
          <button onClick={handlePrev} className={styles.arrowButton}>
            <img src={ArrowLeft} alt="上一张" />
          </button>
          <div className={styles.cardContainer}>
            {cards.map((card, index) => (
                <div
                key={card.id}
                className={getCardClass(index)}
                onClick={() => handleCardClick(card.id)}
              >
                <img src={card.src} alt={card.name} />
              </div>
            ))}
          </div>
          <button onClick={handleNext} className={styles.arrowButton}>
            <img src={ArrowRight} alt="下一张" />
          </button>
        </div>
        <button className={styles.selectButton} onClick={handleNextPage}
        disabled={!selectedCardId}>
          <img src={SelectButtonSVG} alt="下一步" />
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

export default Page14_User_1;