// src/pages/Page12_InfS_1.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext'; 

// 临时使用 SVG（等待 PNG 文件）
import CardInfS1 from '../assets/卡片/正面/InfS-1-1.png';
import CardInfS2 from '../assets/卡片/正面/InfS-2-1.png';
import CardInfS3 from '../assets/卡片/正面/InfS-3-1.png';
import ArrowLeft from '../assets/网页素材/向左.svg';
import ArrowRight from '../assets/网页素材/向右.svg';
import SelectButtonSVG from '../assets/页面剩余素材/Page68101214按钮.svg';

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page12_InfS_1.module.css'; 
import { getAiResponse } from '../services/aiService';
// 场景卡片数据
const cards = [
  { id: 1, src: CardInfS1, name: '自我数据' },
  { id: 2, src: CardInfS2, name: '他人影响' },
  { id: 3, src: CardInfS3, name: '专家干预' },
];

const Page12_1 = () => {
  
  const navigate = useNavigate();
  const { setActiveStageId, setMultipleCards, completeStage } = useTimeline(); // 使用 setMultipleCards
  const { designData, updateDesignData } = useDesign();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  // --- 2. 新增状态来存储 AI 推荐的卡片 ---
  const [recommendedCardNames, setRecommendedCardNames] = useState([]);
  const [initialBotMessage, setInitialBotMessage] = useState("正在为你推荐信息源..."); 
  
  // --- 3. 使用 useEffect 调用 AI ---
  useEffect(() => {
    setActiveStageId(5);
    
    const fetchRecommendations = async () => {
      if (designData.mechanismCards && designData.mechanismCards.length > 0) {
        try {
          const aiResult = await getAiResponse(
            [],
            'recommendInfoSources',
            { ...designData } // 传递所有上下文数据
          );
          setInitialBotMessage(aiResult.responseText);
          if (aiResult.extractedData && aiResult.extractedData.recommendedCards) {
            setRecommendedCardNames(aiResult.extractedData.recommendedCards);
          }
        } catch (error) {
          console.error("获取 AI 信息源推荐失败:", error);
          setInitialBotMessage("抱歉，推荐服务暂时无法连接。请直接从左侧选择。");
        }
      } else {
        setInitialBotMessage("请先完成前面的步骤，然后选择信息源。");
      }
    };
    fetchRecommendations();
  }, [setActiveStageId, designData]);

  const handleCardClick = (cardId) => {
    const newSelectedIds = [...selectedCardIds];
    const cardIndex = newSelectedIds.indexOf(cardId);
    if (cardIndex > -1) {
      newSelectedIds.splice(cardIndex, 1);
    } else {
      newSelectedIds.push(cardId);
    }
    setSelectedCardIds(newSelectedIds);
    setMultipleCards(5, newSelectedIds); // 更新 Timeline
  };

  const handleNextPage = () => {
    if (selectedCardIds.length > 0) {
      const selectedNames = cards
        .filter(c => selectedCardIds.includes(c.id))
        .map(c => c.name);
      updateDesignData('infoSourceCards', selectedNames);
      completeStage(5);
      navigate('/page13');
    }
  };

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  
  // --- 4. 更新 getCardClass 以高亮推荐和选中的卡片 ---
  const getCardClass = (index) => {
    const card = cards[index];
    const classes = [styles.card];
    // ... (轮播逻辑不变)
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
    if (index === currentIndex) classes.push(styles.active);
    else if (index === prevIndex) classes.push(styles.prev);
    else if (index === nextIndex) classes.push(styles.next);
    else classes.push(styles.hidden);

    if (recommendedCardNames.includes(card.name)) {
      classes.push(styles.recommended); // 高亮推荐
    }
    if (selectedCardIds.includes(card.id)) {
      classes.push(styles.selected); // 高亮选中
    }
    return classes.join(' ');
  };

  const dummyGetAiResponse = async (input) => ({ responseText: "请在左侧选择至少一张卡片后点击下方的按钮继续。" });


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
        disabled={selectedCardIds.length === 0}>
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

export default Page12_1;