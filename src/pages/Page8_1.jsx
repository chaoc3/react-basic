// src/pages/Page8_Scenario_1.jsx (Page 8)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext'; 

// SVG Asset Imports (卡片正面)
import { ReactComponent as CardScenario1 } from '../assets/卡片 - svg/卡片正面-选择页/Scenario-1-1.svg';
import { ReactComponent as CardScenario2 } from '../assets/卡片 - svg/卡片正面-选择页/Scenario-2-1.svg';
import { ReactComponent as CardScenario3 } from '../assets/卡片 - svg/卡片正面-选择页/Scenario-3-1.svg';
import { ReactComponent as CardScenario4 } from '../assets/卡片 - svg/卡片正面-选择页/Scenario-4-1.svg';
import { ReactComponent as CardScenario5 } from '../assets/卡片 - svg/卡片正面-选择页/Scenario-5-1.svg';
import { ReactComponent as CardScenario6 } from '../assets/卡片 - svg/卡片正面-选择页/Scenario-6-1.svg';
import { ReactComponent as ArrowLeft } from '../assets/网页素材/向左.svg';
import { ReactComponent as ArrowRight } from '../assets/网页素材/向右.svg';
import { ReactComponent as SelectButtonSVG } from '../assets/页面剩余素材/Page68101214按钮.svg';

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page8_Scenario_1.module.css'; // 假设样式文件已存在

// 场景卡片数据
const cards = [
  { id: 1, component: <CardScenario1 />, name: '居家场景' },
  { id: 2, component: <CardScenario2 />, name: '工作场景' },
  { id: 3, component: <CardScenario3 />, name: '户外场景' },
  { id: 4, component: <CardScenario4 />, name: '医疗场景' },
  { id: 5, component: <CardScenario5 />, name: '社区场景' },
  { id: 6, component: <CardScenario6 />, name: '多场景' }
];

const Page8_1 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, setSingleCard, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [initialBotMessage, setInitialBotMessage] = useState("正在思考如何为你推荐场景..."); 
  
  // --- 1. 模拟 AI 推荐逻辑 (Page 6 的逻辑) ---
  useEffect(() => {
    setActiveStageId(3); // Page 8 对应 Stage 3
    // 模拟 AI 推荐，基于 Target-User 和 User 字段
    if (designData.targetUser && designData.user) {
        // 实际应该调用 AI Service，这里使用 Dummy Message
        setInitialBotMessage(`根据你选择的 ${designData.user} 和目标 ${designData.targetUser}，我为你推荐了几个场景。请在左侧选择一个。`);
    } else {
        setInitialBotMessage("请先完成前面的步骤，然后选择一个场景卡片。");
    }
  }, [setActiveStageId, designData.targetUser, designData.user]);

  // --- 2. UI 交互逻辑 (Page 6 的逻辑) ---
  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    setSingleCard(3, cardId); 
  };

  const handleNextPage = () => {
    if (selectedCardId) {
      const selectedCardName = cards.find(c => c.id === selectedCardId)?.name;
      
      // 关键：保存选中的场景名称到 Context
      if (selectedCardName) {
        updateDesignData('scenarioCard', selectedCardName);
      }
      
      completeStage(3);
      navigate('/page9'); // 跳转到 Page 9
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
    if (selectedCardId === cards[index].id) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  // --- 3. Dummy AI 函数 (Page 6 的逻辑) ---
  const dummyGetAiResponse = async (input) => ({ responseText: "请在左侧选择卡片后点击下方的按钮继续。" });

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
        disabled={!selectedCardId}>
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

export default Page8_1;