// src/pages/Page14_Mod_1.jsx

import React, { useState, useEffect, useRef } from 'react';
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
import { getAiResponse } from '../services/aiService';

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
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [recommendedCardName, setRecommendedCardName] = useState('');
  const [initialBotMessage, setInitialBotMessage] = useState("正在为你推荐交互模态..."); 

  // 【修复1】引入 useRef 锁，防止重复请求
  const hasInitialized = useRef(false);

  // --- 3. 使用 useEffect 调用 AI ---
  useEffect(() => {
    setActiveStageId(6);
    
    const fetchRecommendation = async () => {
      // 【修复1】检查锁
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      // 检查前置数据是否存在
      if (designData.infoSourceCards && designData.infoSourceCards.length > 0) {
        try {
          const aiResult = await getAiResponse(
            [],
            'recommendMode',
            { ...designData }
          );
          setInitialBotMessage(aiResult.responseText);
          
          // 从 AI 的回复文本中解析出推荐的卡片名
          const recommendedCard = cards.find(card => aiResult.responseText.includes(`‘${card.name}’`));
          if (recommendedCard) {
            setRecommendedCardName(recommendedCard.name);
          }

        } catch (error) {
          console.error("获取 AI 模态推荐失败:", error);
          setInitialBotMessage("抱歉，推荐服务暂时无法连接。请直接从左侧选择。");
        }
      } else {
        setInitialBotMessage("请先完成前面的步骤，然后选择交互模态。");
      }
    };

    fetchRecommendation();
    // 【修复3】依赖数组中移除 designData，只保留 setActiveStageId
    // 因为我们只希望在页面挂载时执行一次，不希望 designData 变化时重新触发
  }, [setActiveStageId]);

  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    setSingleCard(6, cardId);
  };

  const handleNextPage = () => {
    if (selectedCardId) {
      const selectedCardName = cards.find(c => c.id === selectedCardId)?.name;
      if (selectedCardName) {
        updateDesignData('modeCard', selectedCardName);
      }
      // 注意：通常 completeStage 会在 Page 15 完成，但如果你希望在这里标记也可以
      // completeStage(6); 
      navigate('/page15');
    }
  };

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  
  const getCardClass = (index) => {
    const card = cards[index];
    const classes = [styles.card];
    
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
    
    if (index === currentIndex) classes.push(styles.active);
    else if (index === prevIndex) classes.push(styles.prev);
    else if (index === nextIndex) classes.push(styles.next);
    else classes.push(styles.hidden);

    if (recommendedCardName === card.name) {
      classes.push(styles.recommended); // 高亮推荐
    }
    if (selectedCardId === card.id) {
      classes.push(styles.selected); // 高亮选中
    }
    return classes.join(' ');
  };

  // 更新参数签名以匹配 ChatDialog
  const dummyGetAiResponse = async (userInput, currentMessages) => ({ 
    responseText: "请在左侧选择卡片后点击下方的按钮继续。" 
  });

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
        {/* 【修复2】移除了 key={initialBotMessage} */}
        <ChatDialog
          initialBotMessage={initialBotMessage}
          getAiResponse={dummyGetAiResponse}
        />
      </div>
    </div>
  );
};

export default Page14_User_1;