// src/pages/Page7_User_2.jsx

import { ReactComponent as CardUser1 } from '../assets/卡片 - svg/卡片正面-选择页/Mod-1-1.svg';
import { ReactComponent as CardUser2 } from '../assets/卡片 - svg/卡片正面-选择页/Mod-2-1.svg';
import { ReactComponent as CardUser3 } from '../assets/卡片 - svg/卡片正面-选择页/Mod-3-1.svg';
import { ReactComponent as CardUser4 } from '../assets/卡片 - svg/卡片正面-选择页/Mod-4-1.svg';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg'; // 假设 "Next" 按钮是同一个
import React, { useEffect,useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page7_User_2.module.css'; // 使用新的样式文件
import Page16_Sum from './Page16_Sum';


// 卡片数据定义，与 Page6 保持一致
const cards = [
  { id: 1, component: <CardUser1 />, name: '慢病患者' },
  { id: 2, component: <CardUser2 />, name: '健康风险人群' },
  { id: 3, component: <CardUser3 />, name: '心理健康群体' },
  { id: 4, component: <CardUser4 />, name: '心理健康群体'}
];

const Page15_2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 从 location.state 中获取传递过来的卡片 ID
  // 使用可选链操作符 `?.` 以防止 state 为 null 时出错
  const selectedId = location.state?.selectedCardId;
  const [isSumOpen, setIsSumOpen] = useState(false);

  // 2. 根据 ID 找到完整的卡片对象
  const selectedCard = cards.find(card => card.id === selectedId);

  // 健壮性处理：如果用户直接访问 /page7 或没有 ID，则跳转回选择页面
  useEffect(() => {
    if (!selectedCard) {
      console.warn("No selected card found, redirecting to page 6.");
      navigate('/page14'); // 假设 Page6 的路由是 '/page6'
    }
  }, [selectedCard, navigate]);

  const handleNextPage = () => {
    console.log("Navigating to the next page (e.g., Page 8)");
    setIsSumOpen(true);
  };

  const handleCloseSum = (entryPoint) => {
    setIsSumOpen(false);
    // 根据需求，从Page15进入的，关闭后跳转到下一页useState
    if (entryPoint === 'page15Next') {
        navigate('/summary'); // 跳转到 Page17
    }
};

  // Dummy functions for ChatDialog
  const dummyOnSendMessage = async (input) => {
    console.log(`User input (disabled): ${input}`);
    return { responseText: "This is a static reply." };
  };
  const dummyOnDataExtracted = (data) => {
    console.log("Data extraction (disabled). Received:", data);
  };

  // 如果没有找到卡片，可以渲染一个加载中或 null，等待 useEffect 跳转
  if (!selectedCard) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        {/* BranchSelector 可能需要更新 activeStageId */}
        <BranchSelector activeStageId={2} />
      </div>
      <div className={styles.mainContent}>
        {/* 3. 直接渲染被选中的卡片，不再需要轮播结构 */}
        <div className={styles.cardDisplay}>
          <div className={styles.card}>
            {selectedCard.component}
          </div>
        </div>
        <button className={styles.nextButton} onClick={handleNextPage}>
          <NextButtonSVG />
        </button>
        <Page16_Sum 
                isOpen={isSumOpen}
                onClose={handleCloseSum}
                entryPoint="page15Next" // 明确指定进入点
            />
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