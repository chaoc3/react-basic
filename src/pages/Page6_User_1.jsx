import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext'; // Import the global state hook

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import { useDesign } from '../context/DesignContext'; // 1. 导入 DesignContext
import { getAiResponse } from '../services/aiService'; 
// SVG Asset Imports
import { ReactComponent as CardUser1 } from '../assets/卡片 - svg/卡片正面-选择页/User-1-1.svg';
import { ReactComponent as CardUser2 } from '../assets/卡片 - svg/卡片正面-选择页/User-2-1.svg';
import { ReactComponent as CardUser3 } from '../assets/卡片 - svg/卡片正面-选择页/User-3-1.svg';
import { ReactComponent as ArrowLeft } from '../assets/网页素材/向左.svg';
import { ReactComponent as ArrowRight } from '../assets/网页素材/向右.svg';
import { ReactComponent as SelectButtonSVG } from '../assets/页面剩余素材/Page68101214按钮.svg';

// CSS Module Import
import styles from './styles/Page6_User_1.module.css';

// Card data definition
const cards = [
  { 
    id: 1, 
    component: <CardUser1 />, 
    name: '慢病患者',
    description: '已确诊慢性疾病，需要长期自我管理与治疗依从性支持的人群。' 
  },
  { 
    id: 2, 
    component: <CardUser2 />, 
    name: '健康风险人群',
    description: '具有较高健康风险因素（如不良生活习惯、家族病史），需要预防性干预和健康教育的人群。'
  },
  { 
    id: 3, 
    component: <CardUser3 />, 
    name: '心理健康群体',
    description: '面临压力、焦虑等心理健康挑战，需要情绪支持和应对策略引导的人群。'
  },
];

const Page6_User_1 = () => {
  const navigate = useNavigate();
  
  // Get state management functions from the global TimelineContext
  const { setActiveStageId, setSingleCard, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();
  // Local state for UI management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [initialBotMessage, setInitialBotMessage] = useState("正在思考如何为你推荐..."); // 初始加载消息
  // On component mount, set the current stage in the timeline to active
  useEffect(() => {
    setActiveStageId(2); // This page corresponds to Stage 2 in the timeline
  }, [setActiveStageId]);

  const fetchRecommendation = async () => {
      if (designData.targetUser) {
        const aiResult = await getAiResponse(
          [], // 初始对话历史为空
          'recommendUserGroup', // 任务名称
          { targetUser: designData.targetUser } // 传入 Target-User
        );
        setInitialBotMessage(aiResult.responseText); // 更新 ChatDialog 的初始消息
      } else {
        // 如果没有 targetUser，提供一个默认消息
        setInitialBotMessage("让我们一起确定你的设计对象吧！请在左侧选择一个用户画像。");
      }
    };
  // Handles clicking on a card to select it
  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    // Update the global state to reflect the selection for Stage 2
    setSingleCard(2, cardId); 
  };

  // Handles navigation to the next page
  const handleNextPage = () => {
    if (selectedCardId) {
      const selectedCardName = cards.find(c => c.id === selectedCardId)?.name;
      if (selectedCardName) {
        updateDesignData('user', selectedCardName);
      }
      // Mark Stage 2 as completed in the global state
      completeStage(2);
      // Navigate to Page 7, passing the selected card's ID
      navigate('/page7');
    }
  };

  // Carousel navigation functions
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));

  // Dynamically calculates CSS classes for carousel animation and selection highlight
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

  // Dummy functions for the ChatDialog component
  const dummyGetAiResponse = async (input) => ({ responseText: "请在左侧选择卡片后点击下方的按钮继续。" });
  const dummyOnDataExtracted = (data) => {
    console.log("Data extraction (UI mode). Received:", data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        {/* BranchSelector now reads directly from the context, no props needed */}
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
        <button 
          className={styles.selectButton} 
          onClick={handleNextPage}
          disabled={!selectedCardId} // Button is disabled until a card is selected
        >
          <SelectButtonSVG />
        </button>
      </div>

      <div className={styles.rightPanel}>
        <ChatDialog
          key={initialBotMessage} // 使用 key 来强制重新渲染
          initialBotMessage={initialBotMessage}
          // 关键修改：将 onSendMessage 替换为 getAiResponse
          getAiResponse={dummyGetAiResponse} 
          // 这个页面不提取数据
        />
      </div>
    </div>
  );
};

export default Page6_User_1;