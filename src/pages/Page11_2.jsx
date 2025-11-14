// src/pages/Page9_Scenario_2.jsx

import Mec1 from '../assets/卡片背面/Mec-1-2.png';
import Mec2 from '../assets/卡片背面/Mec-2-2.png';
import Mec3 from '../assets/卡片背面/Mec-3-2.png';
import Mec4 from '../assets/卡片背面/Mec-4-2.png';
import Mec5 from '../assets/卡片背面/Mec-5-2.png';
import Mec6 from '../assets/卡片背面/Mec-6-2.png';
import Mec7 from '../assets/卡片背面/Mec-7-2.png';
import Mec8 from '../assets/卡片背面/Mec-8-2.png';
import { getAiResponse } from '../services/aiService'; 
import { ReactComponent as ArrowLeft } from '../assets/网页素材/向左.svg';
import { ReactComponent as ArrowRight } from '../assets/网页素材/向右.svg';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg';
import React, { useState, useEffect, useMemo,useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
// 为了保证布局不变，我们复用同一个 CSS 文件
import styles from './styles/Page11_Mec_2.module.css';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';

import OverlayCard from '../components/OverlayCard'; // 导入通用卡片组件

const CURRENT_STAGE_ID = 4;

// 拥有所有卡片定义的 "主列表"
const allCards = [
  { id: 1, image: Mec1, name: '提醒和活动建议', keys: ['strategy1', 'strategy2', 'strategy3'] },
  { id: 2, image: Mec2, name: '反馈与激励', keys: ['strategy1', 'strategy2', 'strategy3'] },
  { id: 3, image: Mec3, name: '决策简化', keys: ['strategy1', 'strategy2', 'strategy3'] },
  { id: 4, image: Mec4, name: '社会支持', keys: ['strategy1', 'strategy2', 'strategy3'] },
  { id: 5, image: Mec5, name: '承诺与一致', keys: ['strategy1', 'strategy2', 'strategy3'] },
  { id: 6, image: Mec6, name: '损失厌恶', keys: ['strategy1', 'strategy2', 'strategy3'] },
  { id: 7, image: Mec7, name: '锚定效应', keys: ['strategy1', 'strategy2', 'strategy3'] },
  { id: 8, image: Mec8, name: '稀缺性', keys: ['strategy1', 'strategy2', 'strategy3'] },
];


// 拥有所有卡片定义的 "主列表"


const Page11_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析机制策略，请稍候...");
  const [currentIndex, setCurrentIndex] = useState(0);

  // 筛选出需要展示的卡片
  const selectedCards = useMemo(() => 
    allCards.filter(card => designData.mechanismCards.includes(card.name)), 
    [designData.mechanismCards]
  );
  
  // --- 1. AI 引导逻辑 ---
  const startStrategyBuilding = useCallback(async () => {
    if (selectedCards.length > 0) {
      const aiResult = await getAiResponse(
        [], 
        'buildMechanismDetails', // 假设后端任务名为 buildMechanismDetails
        { 
          mechanismCards: designData.mechanismCards,
          mechanismDetails: designData.mechanismDetails,
          // 传递其他设计目标，供 AI 参考
          targetUser: designData.targetUser,
          targetStage: designData.targetStage,
        }
      );
      
      setInitialBotMessage(aiResult.responseText);
      
      if (aiResult.extractedData && aiResult.extractedData.mechanismDetails) {
        updateDesignData('mechanismDetails', aiResult.extractedData.mechanismDetails);
      }
      
      if (aiResult.isTaskComplete) {
        setIsTaskComplete(true);
      }

    } else {
      console.warn("No selected mechanism cards found, redirecting to /page10.");
      navigate('/page10');
    }
  }, [selectedCards, designData, navigate, updateDesignData]);

  useEffect(() => {
    setActiveStageId(CURRENT_STAGE_ID);
    startStrategyBuilding();
  }, [setActiveStageId, startStrategyBuilding]);

  // --- 2. AI 交互函数 ---
  const handleSendMessage = async (userInput, currentMessages) => {
    const messagesForApi = [...currentMessages, { sender: 'user', text: userInput }];
    
    const aiResult = await getAiResponse(
      messagesForApi,
      'buildMechanismDetails', 
      { 
        mechanismCards: designData.mechanismCards,
        mechanismDetails: designData.mechanismDetails,
        targetUser: designData.targetUser,
        targetStage: designData.targetStage,
      }
    );
    return aiResult; 
  };

  // --- 3. 数据提取和任务完成逻辑 ---
  const handleDataExtracted = (data) => {
    if (data && data.mechanismDetails) {
        const newlyExtractedDetails = data.mechanismDetails;
        
        // 1. 提取到新数据，合并到全局状态
        updateDesignData('mechanismDetails', newlyExtractedDetails);
        
        // 2. 检查完整性
        // 检查所有已选卡片的 3 个策略是否都已填充
        const requiredKeys = selectedCards.flatMap(card => card.keys); // 应该总是 ['strategy1', 'strategy2', 'strategy3']
        
        // 获取合并后的最新数据
        const currentDetails = { 
            ...designData.mechanismDetails, 
            ...newlyExtractedDetails      
        };
        
        // 检查所有 3 个策略 key 是否都有非空值
        const allFieldsCollected = requiredKeys.every(key => 
            currentDetails[key] != null && currentDetails[key].trim() !== ''
        );
        
        // 3. 如果完整，则手动触发任务完成
        if (allFieldsCollected) {
            handleTaskComplete({ isManualComplete: true });
        }
    }
  };

  const handleTaskComplete = (data) => {
    if (data.isManualComplete || data.isTaskComplete) {
        setIsTaskComplete(true);
        
        setTimeout(() => {
            handleNextPage();
        }, 1500);
    }
  };

  const handleNextPage = () => {
    completeStage(CURRENT_STAGE_ID); 
    navigate('/page12'); // 跳转到 Page 12
  };

  // 轮播和类名逻辑 (与 Page 6 相同)
  const showArrows = selectedCards.length > 1;
  const handlePrev = () => { /* ... */ }; // 逻辑不变
  const handleNext = () => { /* ... */ }; // 逻辑不变
  const getCardClass = (index) => { /* ... */ }; // 逻辑不变

  // 渲染逻辑
  if (selectedCards.length === 0) {
    return null;
  }
  
  // 构造 OverlayCard 需要的字段数据
  const currentCard = selectedCards[currentIndex];
  const mechanismFields = currentCard.keys.map((key, index) => ({
    label: `策略 ${index + 1}`, // 策略 1, 策略 2, 策略 3
    value: designData.mechanismDetails?.[key],
    placeholder: `待补充 ${currentCard.name} 的具体策略...`
  }));

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardCarousel}>
          {showArrows && <button onClick={handlePrev} className={styles.arrowButton}><ArrowLeft /></button>}
          <div className={styles.cardContainer}>
            {/* 遍历筛选后的 `selectedCards` 数组来渲染轮播 */}
            {selectedCards.map((card, index) => (
              <div key={card.id} className={getCardClass(index)}>
                {/* MODIFICATION: 使用 OverlayCard */}
                <OverlayCard 
                    backgroundImageUrl={card.image}
                    // 只有当前显示的卡片才叠加信息
                    fields={index === currentIndex ? mechanismFields : []} 
                />
              </div>
            ))}
          </div>
          {showArrows && <button onClick={handleNext} className={styles.arrowButton}><ArrowRight /></button>}
        </div>
        <button className={styles.selectButton} onClick={handleNextPage} disabled={!isTaskComplete}>
          <NextButtonSVG />
        </button>
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog 
          key={initialBotMessage}
          initialBotMessage={initialBotMessage} 
          getAiResponse={handleSendMessage} 
          onDataExtracted={handleDataExtracted}
          onTaskComplete={handleTaskComplete}
        />
      </div>
    </div>
  );
};

export default Page11_2;