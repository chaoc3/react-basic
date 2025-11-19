import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext'; // Import the global state hook

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import { useDesign } from '../context/DesignContext'; // 1. 导入 DesignContext
import { getAiResponse } from '../services/aiService'; 
// PNG Asset Imports（作为图片 URL 导入）
import CardUser1 from '../assets/卡片/正面/User-1-1.png';
import CardUser2 from '../assets/卡片/正面/User-2-1.png';
import CardUser3 from '../assets/卡片/正面/User-3-1.png';
import ArrowLeft from '../assets/网页素材/向左.svg';
import ArrowRight from '../assets/网页素材/向右.svg';
import SelectButtonSVG from '../assets/页面剩余素材/Page68101214按钮.svg';

// CSS Module Import
import styles from './styles/Page6_User_1.module.css';

// Card data definition
const cards = [
  { 
    id: 1, 
    src: CardUser1, 
    name: '慢病患者',
    description: '已确诊慢性疾病，需要长期自我管理与治疗依从性支持的人群。' 
  },
  { 
    id: 2, 
    src: CardUser2, 
    name: '健康风险人群',
    description: '具有较高健康风险因素（如不良生活习惯、家族病史），需要预防性干预和健康教育的人群。'
  },
  { 
    id: 3, 
    src: CardUser3, 
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

useEffect(() => {
  if (!designData.user) {
    setSelectedCardId(null);
    return;
  }
  const matchedCard = cards.find(card => card.name === designData.user);
  if (matchedCard && matchedCard.id !== selectedCardId) {
    setSelectedCardId(matchedCard.id);
    setSingleCard(2, matchedCard.id);
  }
}, [designData.user, selectedCardId, setSingleCard]);

useEffect(() => {
  const fetchRecommendation = async () => {
    // 确保前置数据存在
    if (designData.targetUser) {
      try {
        const aiResult = await getAiResponse(
          [], // 初始对话历史为空
          'recommendUserGroup', // 后端定义的任务名称
          { // 传入所有相关信息以获得更好的推荐
            targetUser: designData.targetUser,
            targetPainpoint: designData.targetPainpoint,
            targetStage: designData.targetStage,
          }
        );
        // 将 AI 的回复设置为聊天机器人的初始消息
        setInitialBotMessage(aiResult.responseText);
      } catch (error) {
        console.error("获取 AI 推荐失败:", error);
        setInitialBotMessage("抱歉，推荐服务暂时无法连接。请直接从左侧选择一个用户画像。");
      }
    } else {
      // 如果缺少前置数据，则提供默认引导
      setInitialBotMessage("让我们一起确定你的设计对象吧！请在左侧选择一个用户画像。");
    }
  };

  fetchRecommendation();
}, [designData.targetUser, designData.targetPainpoint, designData.targetStage]); // 依赖项确保在数据加载后执行
  // Handles clicking on a card to select it
const handleCardClick = (cardId) => {
  setSelectedCardId(cardId);
  setSingleCard(2, cardId); 

  const selectedCard = cards.find((card) => card.id === cardId);
  if (selectedCard) {
    updateDesignData('user', selectedCard.name);
  }
};

  // Handles navigation to the next page
  const handleNextPage = () => {
  if (selectedCardId && designData.user) {
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
          disabled={!selectedCardId} // Button is disabled until a card is selected
        >
          <img src={SelectButtonSVG} alt="下一步" />
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