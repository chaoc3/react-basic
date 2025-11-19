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
import { useTimeline } from '../context/TimelineContext'; // 1. 导入 useTimeline Hook
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

// 根据需求文档，这个阶段是第4个主节点
const CURRENT_STAGE_ID = 4; 

const Page10_Mec_1 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, setMultipleCards, completeStage } = useTimeline(); // Use setMultipleCards
  const { designData, updateDesignData } = useDesign();

  const [currentIndex, setCurrentIndex] = useState(0);
  // --- MODIFICATION 1: State for multi-select and recommendations ---
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [recommendedCardNames, setRecommendedCardNames] = useState([]);
  const [initialBotMessage, setInitialBotMessage] = useState("正在为你生成助推策略推荐...");

  // --- MODIFICATION 2: Call AI for recommendations ---
  useEffect(() => {
    setActiveStageId(CURRENT_STAGE_ID);

    const fetchRecommendations = async () => {
      // Ensure all required data is present
      if (designData.targetUser && designData.user && designData.scenarioCard) {
        try {
          const aiResult = await getAiResponse(
            [],
            'recommendMechanisms',
            { ...designData } // Pass all existing design data
          );
          
          setInitialBotMessage(aiResult.responseText);

          // Check for extracted data from the tool
          if (aiResult.extractedData && aiResult.extractedData.recommendedCards) {
            setRecommendedCardNames(aiResult.extractedData.recommendedCards);
          }

        } catch (error) {
          console.error("获取 AI 机制推荐失败:", error);
          setInitialBotMessage("抱歉，推荐服务暂时无法连接。请直接从左侧选择。");
        }
      } else {
        setInitialBotMessage("请先完成前面的步骤，然后选择助推机制。");
      }
    };

    fetchRecommendations();
  }, [setActiveStageId, designData]); // Depend on the whole designData object

  // --- MODIFICATION 3: Handle multi-card clicks ---
  const handleCardClick = (cardId) => {
    const newSelectedIds = [...selectedCardIds];
    const cardIndex = newSelectedIds.indexOf(cardId);

    if (cardIndex > -1) {
      newSelectedIds.splice(cardIndex, 1); // Deselect if already selected
    } else {
      newSelectedIds.push(cardId); // Select if not selected
    }

    setSelectedCardIds(newSelectedIds);
    setMultipleCards(CURRENT_STAGE_ID, newSelectedIds); // Update timeline context

    // Update design context with names
    const selectedNames = cards
      .filter(card => newSelectedIds.includes(card.id))
      .map(card => card.name);
    updateDesignData('mechanismCards', selectedNames);
  };

  // --- MODIFICATION 4: Update getCardClass to show recommendations and multi-select ---
  const getCardClass = (index) => {
    const card = cards[index];
    const classes = [styles.card];
    // ... (carousel logic for active, prev, next remains the same)
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
    if (index === currentIndex) classes.push(styles.active);
    else if (index === prevIndex) classes.push(styles.prev);
    else if (index === nextIndex) classes.push(styles.next);
    else classes.push(styles.hidden);

    // Highlight recommended cards
    if (recommendedCardNames.includes(card.name)) {
      classes.push(styles.recommended);
    }
    
    // Highlight selected cards
    if (selectedCardIds.includes(card.id)) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  const handleNextPage = () => {
    if (selectedCardIds.length > 0) {
      completeStage(CURRENT_STAGE_ID);
      navigate('/page11');
    }
  };
  
  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
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

export default Page10_Mec_1;