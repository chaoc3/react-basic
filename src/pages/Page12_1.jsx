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
  
  // 1. 修改点：从 Context 获取 setSingleCard (仿照 Page6)
  const { setActiveStageId, setSingleCard, completeStage } = useTimeline(); 
  const { designData, updateDesignData } = useDesign();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null); // 单选状态
  
  // AI 推荐相关状态
  const [recommendedCardNames, setRecommendedCardNames] = useState([]);
  const [initialBotMessage, setInitialBotMessage] = useState("正在为你推荐信息源..."); 
  
  // 设置当前 Stage
  useEffect(() => {
    setActiveStageId(5);
  }, [setActiveStageId]);

  // 2. 修改点：添加状态回显逻辑 (仿照 Page6)
  // 如果 DesignContext 里已经存了 infoSourceCards，则自动选中对应的卡片
  useEffect(() => {
    // 如果数据不存在，重置选中状态
    if (!designData.infoSourceCards || designData.infoSourceCards.length === 0) {
      setSelectedCardId(null);
      return;
    }

    // 处理数据：infoSourceCards可能是数组（因为之前是多选），我们取第一个作为单选回显
    const savedName = Array.isArray(designData.infoSourceCards) 
      ? designData.infoSourceCards[0] 
      : designData.infoSourceCards;

    const matchedCard = cards.find(card => card.name === savedName);
    
    if (matchedCard && matchedCard.id !== selectedCardId) {
      setSelectedCardId(matchedCard.id);
      setSingleCard(5, matchedCard.id); // 同步到 Timeline
    }
  }, [designData.infoSourceCards, selectedCardId, setSingleCard]);

  // AI 推荐逻辑 (保持原有逻辑)
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (designData.mechanismCards && designData.mechanismCards.length > 0) {
        try {
          const aiResult = await getAiResponse(
            [],
            'recommendInfoSources',
            { ...designData } 
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
  }, [designData]);

  // 3. 修改点：点击处理逻辑 (仿照 Page6)
  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    setSingleCard(5, cardId); // 更新 Timeline 状态

    const selectedCard = cards.find((card) => card.id === cardId);
    if (selectedCard) {
      // 更新 Design 数据
      // 注意：为了保持数据结构兼容性（如果有其他地方当做数组处理），这里存为包含一个元素的数组
      updateDesignData('infoSourceCards', [selectedCard.name]); 
    }
  };

  // 4. 修改点：下一步逻辑 (仿照 Page6)
  const handleNextPage = () => {
    if (selectedCardId && designData.infoSourceCards) {
      completeStage(5);
      navigate('/page13');
    }
  };

  // 轮播逻辑 (保持不变)
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

    if (recommendedCardNames.includes(card.name)) {
      classes.push(styles.recommended);
    }
    // 选中样式判断
    if (selectedCardId === card.id) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  const dummyGetAiResponse = async (input) => ({ responseText: "请在左侧选择一张卡片后点击下方的按钮继续。" });

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
        {/* 按钮状态控制 */}
        <button 
          className={styles.selectButton} 
          onClick={handleNextPage}
          disabled={!selectedCardId} 
        >
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