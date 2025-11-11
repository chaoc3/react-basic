
import { useDesign } from '../context/DesignContext'; 
import { ReactComponent as CardUser1 } from '../assets/卡片 - svg/卡片正面-选择页/User-1-1.svg';
import { ReactComponent as CardUser2 } from '../assets/卡片 - svg/卡片正面-选择页/User-2-1.svg';
import { ReactComponent as CardUser3 } from '../assets/卡片 - svg/卡片正面-选择页/User-3-1.svg';
import { ReactComponent as ArrowLeft } from '../assets/网页素材/向左.svg';
import { ReactComponent as ArrowRight } from '../assets/网页素材/向右.svg';
import { ReactComponent as SelectButtonSVG } from '../assets/页面剩余素材/Page68101214按钮.svg';
import React, { useState,useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page6_User_1.module.css';



const cards = [
  { id: 1, component: <CardUser1 />, name: '慢病患者' },
  { id: 2, component: <CardUser2 />, name: '健康风险人群' },
  { id: 3, component: <CardUser3 />, name: '心理健康群体' },
];

const Page6_User_1 = () => {
  
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null); 
  const { updateDesignData } = useDesign();

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));



  // --- 关键改动：添加一个函数来动态计算类名 ---
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
    // 3. 移除在这里添加 .selected 类的逻辑
    return classes.join(' ');
  };

  const handleNextPage = () => {
    // 因为总有一个卡片是选中的，所以这里不需要检查
    const selectedCard = cards.find(card => card.id === selectedCardId);
      updateDesignData('userCard', { id: selectedCard.id, name: selectedCard.name });
      
      // 4. Navigate without passing state
      navigate('/page7');
  };

  // ... (dummy functions for ChatDialog can remain the same)
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
                onClick={() => setSelectedCardId(card.id)}
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
          initialBotMessage="对话功能当前为UI展示模式。"
          onSendMessage={dummyOnSendMessage}
          onDataExtracted={dummyOnDataExtracted}
        />
      </div>
    </div>
  );
};

export default Page6_User_1;

