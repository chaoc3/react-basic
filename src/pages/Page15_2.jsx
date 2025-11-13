// src/pages/Page15_2.jsx

import CardUser1 from '../assets/卡片背面/Mod-1-2.png';
import CardUser2 from '../assets/卡片背面/Mod-2-2.png';
import CardUser3 from '../assets/卡片背面/Mod-3-2.png';
import CardUser4 from '../assets/卡片背面/Mod-4-2.png';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import Page16_Sum from './Page16_Sum';
import styles from './styles/Page15_Mod_2.module.css';
import { useTimeline } from '../context/TimelineContext';
const cards = [
  { id: 1, component: <img src={CardUser1} alt="Mode 1" />, name: '慢病患者' },
  { id: 2, component: <img src={CardUser2} alt="Mode 2" />, name: '健康风险人群' },
  { id: 3, component: <img src={CardUser3} alt="Mode 3" />, name: '心理健康群体' },
  { id: 4, component: <img src={CardUser4} alt="Mode 4" />, name: '心理健康群体'}
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