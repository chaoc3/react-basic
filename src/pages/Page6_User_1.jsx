import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // 暂时不需要导航
// import { DesignContext } from '../context/DesignContext'; // 暂时不需要 Context

import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page6_User_1.module.css';
import backgroundForPage from '../assets/页面剩余素材/Page68101112131415页面.svg'; 

// Card and Arrow SVGs
import { ReactComponent as CardUser1 } from '../assets/卡片 - svg/卡片正面-选择页/User-1-1.svg';
import { ReactComponent as CardUser2 } from '../assets/卡片 - svg/卡片正面-选择页/User-2-1.svg';
import { ReactComponent as CardUser3 } from '../assets/卡片 - svg/卡片正面-选择页/User-3-1.svg';
import { ReactComponent as ArrowLeft } from '../assets/网页素材/向左.svg';
import { ReactComponent as ArrowRight } from '../assets/网页素材/向右.svg';

const cards = [
  { id: 1, component: <CardUser1 />, name: '慢病患者' },
  { id: 2, component: <CardUser2 />, name: '健康风险人群' },
  { id: 3, component: <CardUser3 />, name: '心理健康群体' },
];

const Page6_User_1 = () => {
  const navigate = useNavigate(); // 暂时注释掉
  // const { updateUserData } = useContext(DesignContext); // 暂时注释掉

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  // const [extractedChatData, setExtractedChatData] = useState(null); // 暂时注释掉

  // --- 移除所有数据处理和AI逻辑 ---

  // --- 简化导航逻辑，只在控制台输出信息 ---
  const handleNextPage = () => {
    if (!selectedCardId) {
        console.log("请先选择一张卡片。");
        return;
    }
    console.log(`跳转到 Page7... (选择的卡片ID是: ${selectedCardId})`);
    
    // 3. 执行跳转
    navigate('/page7'); 
  };


  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));

  // 按钮的禁用逻辑现在只依赖于是否选择了卡片
  const isNextButtonDisabled = !selectedCardId;

  // --- ChatDialog的临时静态配置 ---
  const dummyOnSendMessage = async (input) => {
    console.log(`用户输入了: ${input}`);
    return { responseText: "这是一个静态回复，功能已禁用。" };
  };
  const dummyOnDataExtracted = (data) => {
    console.log("数据提取功能已禁用。收到的数据:", data);
  };


  return (
    <div className={styles.container}
    style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <div className={styles.leftPanel}>
        {/* 时间轴组件可以保留，activeStageId=2 表示当前阶段 */}
        <BranchSelector activeStageId={2} /> 
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardCarousel}>
          <button onClick={handlePrev} className={styles.arrowButton}><ArrowLeft /></button>
          <div className={styles.cardContainer}>
            {cards.map((card, index) => (
              <div
                key={card.id}
                // 点击卡片时，只更新本地 selectedCardId 状态
                className={`${styles.card} ${index === currentIndex ? styles.active : ''} ${selectedCardId === card.id ? styles.selected : ''}`}
                onClick={() => setSelectedCardId(card.id)}
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
          disabled={isNextButtonDisabled}
        >
          Next
        </button>
      </div>
      <div className={styles.rightPanel}>
        {/* ChatDialog 现在使用不会引起错误的静态 props */}
        <ChatDialog
          initialBotMessage="对话功能已禁用，当前仅为UI展示。"
          onSendMessage={dummyOnSendMessage}
          onDataExtracted={dummyOnDataExtracted}
        />
      </div>
    </div>
  );
};

export default Page6_User_1;

