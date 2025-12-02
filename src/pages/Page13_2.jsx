// src/pages/Page13_InfS_2.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService';

// PNG Asset Imports
import CardInfS1 from '../assets/卡片背面/InfS-1-2.png';
import CardInfS2 from '../assets/卡片背面/InfS-2-2.png';
import CardInfS3 from '../assets/卡片背面/InfS-3-2.png';
import NextButtonSVG from '../assets/页面剩余素材/Next按钮.svg'; 

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import OverlayCard from '../components/OverlayCard';
import styles from './styles/Page13_InfS_2.module.css'; 

// 场景卡片数据
const cards = [
  { name: '自我数据', image: CardInfS1, key: 'strategy1' },
  { name: '他人影响', image: CardInfS2, key: 'strategy2' },
  { name: '专家干预', image: CardInfS3, key: 'strategy3' },
];

const Page13_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析信息源细节，请稍候...");
  
  // 【修复1】引入 useRef 锁，防止无限循环
  const hasInitialized = useRef(false);

  // --- 1. 初始化与 AI 开场白 ---
  useEffect(() => {
    setActiveStageId(5);

    const initPage = async () => {
      // 检查是否有选中的卡片
      if (!designData.infoSourceCards || designData.infoSourceCards.length === 0) {
        console.warn("Missing infoSourceCards data, redirecting to /page12.");
        navigate('/page12');
        return;
      }

      // 【修复1】防止死循环：如果已经初始化过，就不再请求 AI
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        const aiResult = await getAiResponse(
          [], 
          'buildInfoSourceDetails', 
          { 
            infoSourceCards: designData.infoSourceCards,
            infoSourceDetails: designData.infoSourceDetails
          }
        );
        
        setInitialBotMessage(aiResult.responseText);
        
        if (aiResult.extractedData && aiResult.extractedData.infoSourceDetails) {
          updateDesignData('infoSourceDetails', aiResult.extractedData.infoSourceDetails);
        }
        
        if (aiResult.isTaskComplete) {
          setIsTaskComplete(true);
        }
      } catch (error) {
        console.error("Init AI Error:", error);
        setInitialBotMessage("请告诉我具体的追踪数据点。");
      }
    };

    initPage();
    // 依赖数组中只放 navigate, designData.infoSourceCards (用于判断是否为空), setActiveStageId
    // 绝对不要放 designData.infoSourceDetails
  }, [navigate, designData.infoSourceCards, setActiveStageId]);

  // --- 2. AI 交互函数 ---
  const handleSendMessage = async (userInput, currentMessages) => {
    // 【修复3】直接使用 currentMessages，不要再手动拼接 userInput
    // 因为 ChatDialog 已经把最新的 userInput 放进 currentMessages 了
    const aiResult = await getAiResponse(
      currentMessages,
      'buildInfoSourceDetails', 
      { 
        infoSourceCards: designData.infoSourceCards,
        infoSourceDetails: designData.infoSourceDetails
      }
    );
    return aiResult; 
  };

  // --- 3. 数据提取和任务完成逻辑 ---
  const handleDataExtracted = (data) => {
    if (data && data.infoSourceDetails) {
        const newlyExtractedDetails = data.infoSourceDetails;
        
        // 1. 提取到新数据，合并到全局状态
        updateDesignData('infoSourceDetails', newlyExtractedDetails);
        
        // 2. 检查完整性
        const requiredKeys = ['strategy1', 'strategy2', 'strategy3'];
        
        const currentDetails = { 
            ...designData.infoSourceDetails, 
            ...newlyExtractedDetails      
        };
        
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
    completeStage(5); 
    navigate('/page14'); 
  };

  if (!designData.infoSourceCards || designData.infoSourceCards.length === 0) {
    return null;
  }
  
  const infoSourceField = [
    { label: '可以追踪的数据点', value: designData.infoSourceDetails?.strategy1, placeholder: '可以追踪的数据点' },
    { label: '可以追踪的数据点', value: designData.infoSourceDetails?.strategy2, placeholder: '可以追踪的数据点' },
    { label: '可以追踪的数据点', value: designData.infoSourceDetails?.strategy3, placeholder: '可以追踪的数据点' },
  ];

  const firstSelectedCard = cards.find(card => designData.infoSourceCards.includes(card.name));
  if (!firstSelectedCard) return null;

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          <OverlayCard 
            backgroundImageUrl={firstSelectedCard.image}
            fields={infoSourceField}
          />
        </div>
        <button 
          className={styles.nextButton} 
          onClick={handleNextPage}
          disabled={!isTaskComplete} 
          style={{ 
            opacity: isTaskComplete ? 1 : 0.5, 
            cursor: isTaskComplete ? 'pointer' : 'not-allowed' 
          }}
        >
          <img src={NextButtonSVG} alt="下一步" />
        </button>
      </div>

      <div className={styles.rightPanel}>
        {/* 【修复2】移除了 key={initialBotMessage}，防止组件销毁重建 */}
        <ChatDialog
          initialBotMessage={initialBotMessage}
          getAiResponse={handleSendMessage} 
          onDataExtracted={handleDataExtracted}
          onTaskComplete={handleTaskComplete}
        />
      </div>
    </div>
  );
};

export default Page13_2;