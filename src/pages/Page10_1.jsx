// src/pages/Page10_1.jsx

import Mec1 from '../assets/卡片/正面/Mec-1-1.png';
import Mec2 from '../assets/卡片/正面/Mec-2-1.png';
import Mec3 from '../assets/卡片/正面/Mec-3-1.png';
import Mec4 from '../assets/卡片/正面/Mec-4-1.png';
import Mec5 from '../assets/卡片/正面/Mec-5-1.png';
import Mec6 from '../assets/卡片/正面/Mec-6-1.png';
import Mec7 from '../assets/卡片/正面/Mec-7-1.png';
import Mec8 from '../assets/卡片/正面/Mec-8-1.png';
import ArrowLeft from '../assets/网页素材/向左.svg';
import ArrowRight from '../assets/网页素材/向右.svg';
import SelectButtonSVG from '../assets/页面剩余素材/Page68101214按钮.svg';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page10_Mec_1.module.css';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService';

const cards = [
  { id: 1, src: Mec1, name: '情景感知提醒' },
  { id: 2, src: Mec2, name: '反馈与激励' },
  { id: 3, src: Mec3, name: '决策简化' },
  { id: 4, src: Mec4, name: '社会影响' },
  { id: 5, src: Mec5, name: '认知重建与反思' },
  { id: 6, src: Mec6, name: '目标设定' },
  { id: 7, src: Mec7, name: '激发好奇心' },
  { id: 8, src: Mec8, name: '诱饵效应' },
];

const CURRENT_STAGE_ID = 4; // 对应 BranchSelector 中的紫色节点 (Stage 4)
const MAX_SELECTIONS = 3;

const Page10_1 = () => {
  const navigate = useNavigate();
  
  // 1. 【关键修改】引入 selectCard 用于更新时间轴状态
  const { setActiveStageId, completeStage, selectCard } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [initialBotMessage, setInitialBotMessage] = useState("正在思考如何为你推荐...");

  useEffect(() => {
    setActiveStageId(CURRENT_STAGE_ID);
  }, [setActiveStageId]);

  // 初始化：从 Context 同步到本地状态
  useEffect(() => {
    const mechanismNames = Array.isArray(designData.mechanismCards)
      ? designData.mechanismCards
      : [];

    if (mechanismNames.length > 0) {
      const ids = cards
        .filter(c => mechanismNames.includes(c.name))
        .map(c => c.id);
      
      setSelectedCardIds(prev => {
        if (JSON.stringify(prev.sort()) === JSON.stringify(ids.sort())) return prev;
        return ids;
      });
      
      // 注意：这里通常不需要在 useEffect 里调用 selectCard，
      // 因为 TimelineContext 应该已经持久化了之前的选择。
      // 如果刷新页面后时间轴丢失，可以在这里遍历 ids 调用 selectCard，但要小心死循环。
    }
  }, [designData.mechanismCards]);

  // AI 推荐逻辑
  useEffect(() => {
    const fetchRecommendation = async () => {
      if (designData.targetUser) {
        try {
          const aiResult = await getAiResponse([], 'recommendMechanisms', { ...designData });
          setInitialBotMessage(aiResult.responseText);
        } catch (error) {
          setInitialBotMessage("抱歉，推荐服务暂时无法连接。请直接从左侧选择一个用户画像。");
        }
      } else {
        setInitialBotMessage("让我们一起确定你的设计对象吧！请在左侧选择一个用户画像。");
      }
    };
    fetchRecommendation();
  }, [designData.targetUser]);

  // --- 点击处理逻辑 ---
  const handleCardClick = (cardId) => {
    const isSelected = selectedCardIds.includes(cardId);
    let newIds;

    if (isSelected) {
      // 取消选中
      newIds = selectedCardIds.filter(id => id !== cardId);
      
      // 2. 【关键修改】同步更新时间轴（取消选中）
      // 假设 selectCard 是 toggle 逻辑，再次调用即为取消
      selectCard(CURRENT_STAGE_ID, cardId); 

    } else {
      // 新增选中
      if (selectedCardIds.length >= MAX_SELECTIONS) {
        console.log(`最多只能选择 ${MAX_SELECTIONS} 张卡片`);
        return; // 超过限制，不执行任何操作
      }
      newIds = [...selectedCardIds, cardId];
      
      // 2. 【关键修改】同步更新时间轴（选中）
      selectCard(CURRENT_STAGE_ID, cardId);
    }

    // 更新本地 UI 状态
    setSelectedCardIds(newIds);

    // 更新全局 Design Context
    const selectedNames = cards
      .filter(c => newIds.includes(c.id))
      .map(c => c.name);
    updateDesignData('mechanismCards', selectedNames);
  };

  const handleNextPage = () => {
    if (selectedCardIds.length > 0) {
      completeStage(CURRENT_STAGE_ID);
      navigate('/page11');
    }
  };

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));

  const getCardClass = (index) => {
    const classes = [styles.card];
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;

    if (index === currentIndex) classes.push(styles.active);
    else if (index === prevIndex) classes.push(styles.prev);
    else if (index === nextIndex) classes.push(styles.next);
    else classes.push(styles.hidden);
    
    if (selectedCardIds.includes(cards[index].id)) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  const dummyGetAiResponse = async () => ({ responseText: "请在左侧选择卡片后点击下方的按钮继续。" });

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
        <button 
          className={styles.selectButton} 
          onClick={handleNextPage}
          disabled={selectedCardIds.length === 0} 
          style={{ 
            opacity: selectedCardIds.length === 0 ? 0.5 : 1, 
            cursor: selectedCardIds.length === 0 ? 'not-allowed' : 'pointer' 
          }}
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

export default Page10_1;