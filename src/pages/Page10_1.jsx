import { ReactComponent as CardUser1 } from '../assets/卡片 - svg/卡片正面-选择页/User-1-1.svg';
import { ReactComponent as CardUser2 } from '../assets/卡片 - svg/卡片正面-选择页/User-2-1.svg';
import { ReactComponent as CardUser3 } from '../assets/卡片 - svg/卡片正面-选择页/User-3-1.svg';
import { ReactComponent as ArrowLeft } from '../assets/网页素材/向左.svg';
import { ReactComponent as ArrowRight } from '../assets/网页素材/向右.svg';
import { ReactComponent as SelectButtonSVG } from '../assets/页面剩余素材/Page68101214按钮.svg';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page6_User_1.module.css';

const cards = [
  { id: 1, component: <CardUser1 />, name: '慢病患者' },
  { id: 2, component: <CardUser2 />, name: '健康风险人群' },
  { id: 3, component: <CardUser3 />, name: '心理健康群体' },
];

const Page8_Scenario_1 = ({ maxSelections = 3 }) => { // 允许通过 props 控制最大选择数，并设置默认值
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  // --- 关键改动：使用一个数组来存储所有被选中卡片的 ID ---
  const [selectedCardIds, setSelectedCardIds] = useState([]);

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));

  // --- 关键改动：处理卡片点击事件的逻辑 ---
  const handleCardClick = (cardId) => {
    setSelectedCardIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(cardId)) {
        // 取消选择
        return prevSelectedIds.filter((id) => id !== cardId);
      } else {
        // 如果未达到上限则添加
        if (prevSelectedIds.length < maxSelections) {
          return [...prevSelectedIds, cardId];
        } else {
          // 已达到上限，不允许选择更多
          console.log(`You can only select exactly ${maxSelections} cards.`);
          return prevSelectedIds;
        }
      }
    });
  };

  // --- 关键改动：根据 selectedCardIds 数组来判断是否添加 .selected 类 ---
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

    // 如果当前卡片的 id 在已选择的数组中，则添加 selected 类
    if (selectedCardIds.includes(cardId)) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  const handleNextPage = () => {
    // 传递被选中的卡片ID数组到下一页
    console.log(`Navigating to Page 7 with selected card IDs: ${selectedCardIds}`);
    // 你可以在这里通过 navigate state 或者其他方式将 selectedCardIds 传递给下一个路由
    navigate('/page7', { state: { selectedCardIds } });
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
                onClick={() => handleCardClick(card.id)} // 使用新的点击处理函数
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
          disabled={selectedCardIds.length !== maxSelections} // 当没有卡片被选中时禁用按钮
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

export default Page8_Scenario_1;