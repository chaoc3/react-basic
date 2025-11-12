// src/pages/Page15_2.jsx

import { ReactComponent as CardUser1 } from '../assets/卡片 - svg/卡片正面-选择页/Mod-1-1.svg';
import { ReactComponent as CardUser2 } from '../assets/卡片 - svg/卡片正面-选择页/Mod-2-1.svg';
import { ReactComponent as CardUser3 } from '../assets/卡片 - svg/卡片正面-选择页/Mod-3-1.svg';
import { ReactComponent as CardUser4 } from '../assets/卡片 - svg/卡片正面-选择页/Mod-4-1.svg';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import Page16_Sum from './Page16_Sum';
import styles from './styles/Page7_User_2.module.css';
import { useTimeline } from '../context/TimelineContext';
const cards = [
  { id: 1, component: <CardUser1 />, name: '慢病患者' },
  { id: 2, component: <CardUser2 />, name: '健康风险人群' },
  { id: 3, component: <CardUser3 />, name: '心理健康群体' },
  { id: 4, component: <CardUser4 />, name: '心理健康群体'}
];

const Page15_2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedId = location.state?.selectedCardId;
  const selectedCard = cards.find(card => card.id === selectedId);
  const { setActiveStageId } = useTimeline();
  const [isSumOpen, setIsSumOpen] = useState(false);

  useEffect(() => {
    setActiveStageId(6);
    if (!selectedCard) {
      console.warn("No selected card found, redirecting to page 14.");
      navigate('/page14');
    }
  }, [selectedCard, navigate]);

  const handleNextPage = () => {
    setIsSumOpen(true);
  };

  // --- 这是修改的核心 ---
  const handleCloseSum = (entryPoint) => {
    // 1. 首先，正常地关闭模态框
    setIsSumOpen(false);

    // 2. 检查是否需要跳转
    if (entryPoint === 'page15Next') {
      // 3. 使用一个非常短的 setTimeout 来延迟导航
      // 这给了 React 足够的时间来执行 Page16_Sum 的 useEffect 清理函数
      setTimeout(() => {
        navigate('/achieve');
      }, 50); // 50毫秒的延迟对用户是无感的
    }
  };

  const dummyOnSendMessage = async (input) => {
    console.log(`User input (disabled): ${input}`);
    return { responseText: "This is a static reply." };
  };

  const dummyOnDataExtracted = (data) => {
    console.log("Data extraction (disabled). Received:", data);
  };

  if (!selectedCard) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector activeStageId={2} />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          <div className={styles.card}>
            {selectedCard.component}
          </div>
        </div>
        <button className={styles.nextButton} onClick={handleNextPage}>
          <NextButtonSVG />
        </button>
        {/*
          为了防止意外，最好在渲染 Page16_Sum 时也加上 isSumOpen 的判断
          这样可以确保在 isSumOpen 为 false 时它一定不被渲染
        */}
        {isSumOpen && (
          <Page16_Sum 
            isOpen={isSumOpen}
            onClose={handleCloseSum}
            entryPoint="page15Next"
          />
        )}
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog
          initialBotMessage="你已选择用户画像，让我们来补充一些细节吧！"
          onSendMessage={dummyOnSendMessage}
          onDataExtracted={dummyOnDataExtracted}
        />
      </div>
    </div>
  );
};

export default Page15_2;