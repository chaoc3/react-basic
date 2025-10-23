import React, { useState } from 'react';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page8_Scenario_1.module.css'; // 复用 Page6 的样式

// 假设您的场景卡片SVG
import { ReactComponent as CardScenario1 } from '../assets/images/card-scenario-1.svg';
import { ReactComponent as CardScenario2 } from '../assets/images/card-scenario-2.svg';
import { ReactComponent as CardScenario3 } from '../assets/images/card-scenario-3.svg';
import { ReactComponent as ArrowLeft } from '../assets/images/arrow-left.svg';
import { ReactComponent as ArrowRight } from '../assets/images/arrow-right.svg';

const cards = [
  { id: 1, component: <CardScenario1 /> },
  { id: 2, component: <CardScenario2 /> },
  { id: 3, component: <CardScenario3 /> },
];

const Page8_Scenario_1 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? cards.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === cards.length - 1 ? 0 : prevIndex + 1));
  };

  const handleSelect = (id) => {
    setSelectedCard(id);
    console.log(`Selected card ID: ${id}, jumping to next page...`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardCarousel}>
          <button onClick={handlePrev} className={styles.arrowButton}>
            <ArrowLeft />
          </button>
          <div className={styles.cardContainer}>
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`${styles.card} ${index === currentIndex ? styles.active : ''} ${selectedCard === card.id ? styles.selected : ''}`}
                onClick={() => setSelectedCard(card.id)}
              >
                {card.component}
              </div>
            ))}
          </div>
          <button onClick={handleNext} className={styles.arrowButton}>
            <ArrowRight />
          </button>
        </div>
        <button 
          className={styles.selectButton}
          onClick={() => handleSelect(cards[currentIndex].id)}
          disabled={selectedCard === null}
        >
          Select
        </button>
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog />
      </div>
    </div>
  );
};

export default Page8_Scenario_1;