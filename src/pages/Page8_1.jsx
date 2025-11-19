// src/pages/Page8_Scenario_1.jsx (Page 8)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext'; 

// PNG Asset Imports (卡片正面，作为图片 URL)
import CardScenario1 from '../assets/卡片/正面/Scenario-1-1.png';
import CardScenario2 from '../assets/卡片/正面/Scenario-2-1.png';
import CardScenario3 from '../assets/卡片/正面/Scenario-3-1.png';
import CardScenario4 from '../assets/卡片/正面/Scenario-4-1.png';
import CardScenario5 from '../assets/卡片/正面/Scenario-5-1.png';
import CardScenario6 from '../assets/卡片/正面/Scenario-6-1.png';
import ArrowLeft from '../assets/网页素材/向左.svg';
import ArrowRight from '../assets/网页素材/向右.svg';
import SelectButtonSVG from '../assets/页面剩余素材/Page68101214按钮.svg';
import { getAiResponse } from '../services/aiService';
// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page8_Scenario_1.module.css'; // 假设样式文件已存在

// 场景卡片数据
const cards = [
  { id: 1, src: CardScenario1, name: '居家场景' },
  { id: 2, src: CardScenario2, name: '工作场景' },
  { id: 3, src: CardScenario3, name: '户外场景' },
  { id: 4, src: CardScenario4, name: '医疗场景' },
  { id: 5, src: CardScenario5, name: '社区场景' },
  { id: 6, src: CardScenario6, name: '多场景' }
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
    setActiveStageId(3);
    
    const fetchRecommendation = async () => {
      if (designData.targetUser && designData.user) {
        try {
          const aiResult = await getAiResponse(
            [], // No chat history needed for initial recommendation
            'recommendScenario', // The new task we defined in the backend
            {
              targetUser: designData.targetUser,
              user: designData.user,
              userProfile: designData.userProfile,
            }
          );
          setInitialBotMessage(aiResult.responseText);
        } catch (error) {
          console.error("获取 AI 场景推荐失败:", error);
          setInitialBotMessage("抱歉，推荐服务暂时无法连接。请直接从左侧选择一个场景。");
        }
      } else {
        // Fallback if previous data is missing
        setInitialBotMessage("请先完成用户画像步骤，然后选择一个场景卡片。");
        // Optional: redirect if data is missing
        // navigate('/page6');
      }
    };

    fetchRecommendation();
  }, [setActiveStageId, designData.targetUser, designData.user, designData.userProfile]);

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

export default Page8_1;