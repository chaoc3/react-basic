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

const Page10_1 = ({ maxSelections = 3 }) => { // 需求文档中是多选，这里可以设为3或更多
const navigate = useNavigate();
const [currentIndex, setCurrentIndex] = useState(0);
const [selectedCardIds, setSelectedCardIds] = useState([]);

// 2. 从全局 Context 获取我们需要的函数
const { setActiveStageId, selectCard, completeStage } = useTimeline();
const { designData, updateDesignData } = useDesign();

// 3. 当组件加载时，设置当前活动的时间轴阶段
useEffect(() => {
  setActiveStageId(CURRENT_STAGE_ID);
}, [setActiveStageId]);

useEffect(() => {
  const idsFromContext = cards
    .filter(card => (designData.mechanismCards || []).includes(card.name))
    .map(card => card.id)
    .slice(0, maxSelections);
  setSelectedCardIds(idsFromContext);
}, [designData.mechanismCards, maxSelections]);

const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));

const handleCardClick = (cardId) => {
  // 4. 在处理本地状态的同时，调用全局状态函数
  const isCurrentlySelected = selectedCardIds.includes(cardId);

  // 在更新状态前检查是否会超出最大选择数
  if (!isCurrentlySelected && selectedCardIds.length >= maxSelections) {
    console.log(`You can only select up to ${maxSelections} cards.`);
    // 可以加一个用户提示，比如 toast
    return; // 阻止选择
  }

  // 更新本地状态以及 DesignContext
  setSelectedCardIds((prevSelectedIds) => {
    let nextSelected;
    if (isCurrentlySelected) {
      nextSelected = prevSelectedIds.filter((id) => id !== cardId);
    } else {
      nextSelected = [...prevSelectedIds, cardId];
    }
    const selectedNames = nextSelected
      .map((id) => cards.find((card) => card.id === id))
      .filter(Boolean)
      .map((card) => card.name);
    updateDesignData('mechanismCards', selectedNames);
    return nextSelected;
  });

  // 同步到全局状态，让时间轴更新
  selectCard(CURRENT_STAGE_ID, cardId);
};

// ... (getCardClass 逻辑保持不变) ...
const getCardClass = (index) => {
  const cardId = cards[index].id;
  const classes = [styles.card];
  const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
  if (index === currentIndex) classes.push(styles.active);
  else if (index === prevIndex) classes.push(styles.prev);
  else if (index === nextIndex) classes.push(styles.next);
  else classes.push(styles.hidden);
  if (selectedCardIds.includes(cardId)) classes.push(styles.selected);
  return classes.join(' ');
};

const handleNextPage = () => {
  // 5. 进入下一页时，标记当前阶段已完成
  if (selectedCardIds.length === maxSelections) { // 或者根据需求设置为 selectedCardIds.length === maxSelections
    completeStage(CURRENT_STAGE_ID);
    navigate('/page11');
  }
};

// ... (dummy functions 保持不变) ...
const dummyOnSendMessage = async (input) => { /* ... */ };
const dummyOnDataExtracted = (data) => { /* ... */ };

return (
  <div className={styles.container}>
    <div className={styles.leftPanel}>
      {/* BranchSelector 现在会自动从 Context 获取状态并正确显示多选的子节点 */}
      <BranchSelector />
    </div>
    <div className={styles.mainContent}>
      {/* ... (轮播和按钮的 JSX 保持不变) ... */}
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
        disabled={selectedCardIds.length !== maxSelections} // 或者根据需求设置为 !== maxSelections
      >
        <img src={SelectButtonSVG} alt="下一步" />
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