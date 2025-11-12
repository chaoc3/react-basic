import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext'; // Import the global state hook

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';

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
  { id: 1, component: <CardUser1 />, name: '慢病患者' },
  { id: 2, component: <CardUser2 />, name: '健康风险人群' },
  { id: 3, component: <CardUser3 />, name: '心理健康群体' },
];

const Page6_User_1 = () => {
  const navigate = useNavigate();
  
  // Get state management functions from the global TimelineContext
  const { setActiveStageId, setSingleCard, completeStage } = useTimeline();

  // Local state for UI management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // On component mount, set the current stage in the timeline to active
  useEffect(() => {
    setActiveStageId(2); // This page corresponds to Stage 2 in the timeline
  }, [setActiveStageId]);

  // Handles clicking on a card to select it
  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    // Update the global state to reflect the selection for Stage 2
    setSingleCard(2, cardId); 
  };

  // Handles navigation to the next page
  const handleNextPage = () => {
    if (selectedCardId) {
      // Mark Stage 2 as completed in the global state
      completeStage(2);
      // Navigate to Page 7, passing the selected card's ID
      navigate('/page7', { state: { selectedId: selectedCardId } });
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
  const dummyOnSendMessage = async (input) => {
    console.log(`User input (UI mode): ${input}`);
    return { responseText: "This is a static reply." };
  };
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
          initialBotMessage="让我们一起确定你的设计对象吧！你希望这个智能代理来帮助什么样的用户群体呢？"
          onSendMessage={dummyOnSendMessage}
          onDataExtracted={dummyOnDataExtracted}
        />
      </div>
    </div>
  );
};

export default Page6_User_1;