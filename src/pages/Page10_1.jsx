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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page10_Mec_1.module.css';
import { useTimeline } from '../context/TimelineContext'; // 1. 导入 useTimeline Hook
import { useDesign } from '../context/DesignContext'; // 1. 导入 useDesign Ho

const cards = [
  { id: 1, component: <Mec1 />, name: '提醒和活动建议' }, // MODIFICATION: 补充机制名称
  { id: 2, component: <Mec2 />, name: '反馈与激励' },
  { id: 3, component: <Mec3 />, name: '决策简化' },
  { id: 4, component: <Mec4 />, name: '社会支持' },
  { id: 5, component: <Mec5 />, name: '承诺与一致' },
  { id: 6, component: <Mec6 />, name: '损失厌恶' },
  { id: 7, component: <Mec7 />, name: '锚定效应' },
  { id: 8, component: <Mec8 />, name: '稀缺性' },
];

const CURRENT_STAGE_ID = 4; 

const Page10_1 = ({ maxSelections = 3 }) => { 
  const navigate = useNavigate();
  const { setActiveStageId, selectCard, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign(); // 导入 updateDesignData

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [initialBotMessage, setInitialBotMessage] = useState("正在思考如何为你推荐机制..."); 

  useEffect(() => {
    setActiveStageId(CURRENT_STAGE_ID);
    // MODIFICATION: 模拟 AI 推荐，基于 Target-Stage
    if (designData.targetStage) {
        setInitialBotMessage(`基于你的目标阶段 **${designData.targetStage}**，我为你筛选了3个可能的助推方向。请选择至少一个。`);
    } else {
        setInitialBotMessage("请先完成前面的步骤，然后选择至少一个机制卡片。");
    }
  }, [setActiveStageId, designData.targetStage]);

  const handleCardClick = (cardId) => {
    const isCurrentlySelected = selectedCardIds.includes(cardId);

    if (!isCurrentlySelected && selectedCardIds.length >= maxSelections) {
      console.log(`You can only select up to ${maxSelections} cards.`);
      return; 
    }

    setSelectedCardIds((prevSelectedIds) => {
      if (isCurrentlySelected) {
        return prevSelectedIds.filter((id) => id !== cardId);
      } else {
        return [...prevSelectedIds, cardId];
      }
    });

    selectCard(CURRENT_STAGE_ID, cardId);
  };

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
    if (selectedCardIds.length > 0) {
      // MODIFICATION: 将选中的机制名称数组保存到 Context
      const selectedNames = selectedCardIds.map(id => cards.find(c => c.id === id)?.name).filter(name => name);
      updateDesignData('mechanismCards', selectedNames);

      completeStage(CURRENT_STAGE_ID);
      navigate('/page11'); // 跳转到 Page 11
    }
  };

// ... (dummy functions 保持不变) ...
const dummyGetAiResponse = async (input) => ({ responseText: "请在左侧选择至少一张卡片后点击下方的按钮继续。" });

return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        {/* ... (轮播和按钮的 JSX 保持不变) ... */}
        <button
          className={styles.selectButton}
          onClick={handleNextPage}
          disabled={selectedCardIds.length === 0} 
        >
          <SelectButtonSVG />
        </button>
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog
          key={initialBotMessage}
          initialBotMessage={initialBotMessage}
          getAiResponse={dummyGetAiResponse}
        />
      </div>
    </div>
  );
};

export default Page10_1;