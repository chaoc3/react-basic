import { ReactComponent as Mec1 } from '../assets/卡片 - svg/卡片正面-选择页/Mec-1-1.svg';
import { ReactComponent as Mec2 } from '../assets/卡片 - svg/卡片正面-选择页/Mec-2-1.svg';
import { ReactComponent as Mec3 } from '../assets/卡片 - svg/卡片正面-选择页/Mec-3-1.svg';
import { ReactComponent as Mec4 } from '../assets/卡片 - svg/卡片正面-选择页/Mec-4-1.svg';
import { ReactComponent as Mec5 } from '../assets/卡片 - svg/卡片正面-选择页/Mec-5-1.svg';
import { ReactComponent as Mec6 } from '../assets/卡片 - svg/卡片正面-选择页/Mec-6-1.svg';
import { ReactComponent as Mec7 } from '../assets/卡片 - svg/卡片正面-选择页/Mec-7-1.svg';
import { ReactComponent as Mec8 } from '../assets/卡片 - svg/卡片正面-选择页/Mec-8-1.svg';
import { ReactComponent as ArrowLeft } from '../assets/网页素材/向左.svg';
import { ReactComponent as ArrowRight } from '../assets/网页素材/向右.svg';
import { ReactComponent as SelectButtonSVG } from '../assets/页面剩余素材/Page68101214按钮.svg';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page6_User_1.module.css';

const cards = [
  { id: 1, component: <Mec1 />, name: '慢病患者' },
  { id: 2, component: <Mec2 />, name: '健康风险人群' },
  { id: 3, component: <Mec3 />, name: '心理健康群体' },
  { id: 4, component: <Mec4 />, name: '心理健康群体' },
  { id: 5, component: <Mec5 />, name: '心理健康群体' },
  { id: 6, component: <Mec6 />, name: '心理健康群体' },
  { id: 7, component: <Mec7 />, name: '心理健康群体' },
  { id: 8, component: <Mec8 />, name: '心理健康群体' },
];


const Page10_1 = ({ maxSelections = 2 }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState([]);

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));

  const handleCardClick = (cardId) => {
    setSelectedCardIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(cardId)) {
        return prevSelectedIds.filter((id) => id !== cardId);
      } else {
        if (prevSelectedIds.length < maxSelections) {
          return [...prevSelectedIds, cardId];
        } else {
          console.log(`You can only select exactly ${maxSelections} cards.`);
          return prevSelectedIds;
        }
      }
    });
  };

  const getCardClass = (index) => {
    const cardId = cards[index].id;
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

    if (selectedCardIds.includes(cardId)) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  const handleNextPage = () => {
    // 修正：使用 selectedCardIds 而不是 selectedCardId
    console.log(`Navigating to Page 11 with selected card IDs: ${selectedCardIds}`);
    navigate('/page11', { state: { selectedCardIds } }); // 修正这里
  };

  const dummyOnSendMessage = async (input) => {
    console.log(`User input (disabled): ${input}`);
    return { responseText: "This is a static reply." };
  };
  
  const dummyOnDataExtracted = (data) => {
    console.log("Data extraction (disabled). Received:", data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector activeStageId={2} />
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
          disabled={selectedCardIds.length !== maxSelections}
        >
          <SelectButtonSVG />
        </button>
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog
          initialBotMessage="对话功能当前为UI展示模式。"
          onSendMessage={dummyOnSendMessage}
          onDataExtracted={dummyOnDataExtracted}
        />
      </div>
    </div>
  );
};

export default Page10_1;