// src/pages/Page9_Scenario_2.jsx

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
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg';
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
// 为了保证布局不变，我们复用同一个 CSS 文件
import styles from './styles/Page6_User_1.module.css';
import { useTimeline } from '../context/TimelineContext';

const CURRENT_STAGE_ID = 4;

const allCards = [
  { id: 1, component: <Mec1 />, name: '慢病患者' },
  { id: 2, component: <Mec2 />, name: '健康风险人群' },
  { id: 3, component: <Mec3 />, name: '心理健康群体' },
  { id: 4, component: <Mec4 />, name: '心理健康群体' },
  { id: 5, component: <Mec5 />, name: '心理健康群体' },
  { id: 6, component: <Mec6 />, name: '心理健康群体' },
  { id: 7, component: <Mec7 />, name: '心理健康群体' },
  { id: 8, component: <Mec8 />, name: '心理健康群体' },
];

// 拥有所有卡片定义的 "主列表"


const Page11_2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveStageId } = useTimeline();
  // 1. 从 Page8 获取选中的 ID 数组
  const selectedIds = location.state?.selectedCardIds || [];

  // 2. 根据 ID 数组从主列表中筛选出需要展示的卡片
  // useMemo 用于优化，避免每次渲染都重新计算
  const selectedCards = useMemo(() => 
    allCards.filter(card => selectedIds.includes(card.id)), 
    [selectedIds]
  );
  
  // 如果没有选择任何卡片就直接访问此页面，则重定向回 Page8
  useEffect(() => {
    // 3. 设置当前活动阶段
    setActiveStageId(CURRENT_STAGE_ID);

    if (selectedIds.length === 0) {
      console.warn("No selected cards found, redirecting to page 10.");
      navigate('/page10');
    }
  }, [selectedIds, navigate, setActiveStageId]);

  // 3. 基于筛选后的 `selectedCards` 数组设置轮播
  const [currentIndex, setCurrentIndex] = useState(0);

  // 只有当 selectedCards 数组长度大于 1 时才需要轮播按钮
  const showArrows = selectedCards.length > 1;

  const handlePrev = () => {
    if (!showArrows) return;
    setCurrentIndex((prev) => (prev === 0 ? selectedCards.length - 1 : prev - 1));
  };
  const handleNext = () => {
    if (!showArrows) return;
    setCurrentIndex((prev) => (prev === selectedCards.length - 1 ? 0 : prev + 1));
  };

  const getCardClass = (index) => {
    const classes = [styles.card];
    
    // 如果只有一张卡片，它永远是 active
    if (!showArrows) {
        classes.push(styles.active);
        return classes.join(' ');
    }

    const prevIndex = currentIndex === 0 ? selectedCards.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === selectedCards.length - 1 ? 0 : currentIndex + 1;

    if (index === currentIndex) classes.push(styles.active);
    else if (index === prevIndex) classes.push(styles.prev);
    else if (index === nextIndex) classes.push(styles.next);
    else classes.push(styles.hidden);
    
    // 在这个页面，所有展示的卡片都是被选中的，所以可以统一添加 selected 样式
    classes.push(styles.selected);

    return classes.join(' ');
  };

  const handleNextPage = () => {
    console.log("Navigating to the next page (e.g., Page 10)");
    navigate('/page12');
  };

  const dummyOnSendMessage = async (input) => { /* ... */ };
  const dummyOnDataExtracted = (data) => { /* ... */ };

  // 在数据加载完成前或重定向前，避免渲染
  if (selectedCards.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector activeStageId={3} />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardCarousel}>
          {showArrows && <button onClick={handlePrev} className={styles.arrowButton}><ArrowLeft /></button>}
          <div className={styles.cardContainer}>
            {/* 4. 遍历筛选后的 `selectedCards` 数组来渲染轮播 */}
            {selectedCards.map((card, index) => (
              <div key={card.id} className={getCardClass(index)}>
                {card.component}
              </div>
            ))}
          </div>
          {showArrows && <button onClick={handleNext} className={styles.arrowButton}><ArrowRight /></button>}
        </div>
        <button className={styles.selectButton} onClick={handleNextPage}>
          <NextButtonSVG />
        </button>
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog initialBotMessage="我们已选定场景，接下来让我们丰富场景的细节吧！" onSendMessage={dummyOnSendMessage} onDataExtracted={dummyOnDataExtracted} />
      </div>
    </div>
  );
};

export default Page11_2;