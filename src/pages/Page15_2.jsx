// src/pages/Page15_Mod_2.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService';

// PNG Asset Imports
import CardMod1 from '../assets/卡片背面/Mod-1-2.png';
import CardMod2 from '../assets/卡片背面/Mod-2-2.png';
import CardMod3 from '../assets/卡片背面/Mod-3-2.png';
import CardMod4 from '../assets/卡片背面/Mod-4-2.png';
import NextButtonSVG from '../assets/页面剩余素材/Next按钮.svg'; 

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import OverlayCard from '../components/OverlayCard';
import Page16_Sum from './Page16_Sum';
import styles from './styles/Page15_Mod_2.module.css'; 

const cards = [
  { name: '文本交互', image: CardMod1 },
  { name: '语言交互', image: CardMod2 },
  { name: '视觉交互', image: CardMod3 },
  { name: '多模态交互', image: CardMod4 },
];

const Page15_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析交互方式细节，请稍候...");
  const [isSumOpen, setIsSumOpen] = useState(false);
  
  // 使用 ref 来防止初始化逻辑重复执行
  const hasInitialized = useRef(false);

  // --- 1. 初始化与 AI 开场白 ---
  useEffect(() => {
    setActiveStageId(6);

    const initPage = async () => {
      // 如果没有选卡片，跳回上一页
      if (!designData.modeCard) {
        console.warn("Missing modeCard data, redirecting to /page14.");
        navigate('/page14');
        return;
      }

      // 防止死循环：如果已经初始化过，就不再请求 AI
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        const aiResult = await getAiResponse(
          [], 
          'buildModeDetails', 
          { 
            modeCard: designData.modeCard,
            modeDetails: designData.modeDetails
          }
        );
        
        setInitialBotMessage(aiResult.responseText);
        
        // 如果 AI 在开场白中就提取到了数据（虽然少见，但为了健壮性）
        if (aiResult.extractedData && aiResult.extractedData.modeDetails) {
          updateDesignData('modeDetails', aiResult.extractedData.modeDetails);
        }
        
        if (aiResult.isTaskComplete) {
          setIsTaskComplete(true);
        }
      } catch (error) {
        console.error("Init AI Error:", error);
        setInitialBotMessage("请告诉我具体的交互策略细节。");
      }
    };

    initPage();
    // 依赖数组中只放 navigate 和 designData.modeCard，绝对不要放 designData.modeDetails
  }, [navigate, designData.modeCard, setActiveStageId]); 

  // --- 2. AI 交互函数 ---
  const handleSendMessage = async (userInput, currentMessages) => {
    // 【修复】直接使用 currentMessages，不要再手动拼接 userInput
    // 因为 ChatDialog 已经把最新的 userInput 放进 currentMessages 了
    const aiResult = await getAiResponse(
      currentMessages,
      'buildModeDetails', 
      { 
        modeCard: designData.modeCard,
        modeDetails: designData.modeDetails
      }
    );
    return aiResult; 
  };

  // --- 3. 数据提取和任务完成逻辑 ---
  const handleDataExtracted = (data) => {
    if (data && data.modeDetails) {
        const newlyExtractedDetails = data.modeDetails;
        
        // 1. 提取到新数据，合并到全局状态
        // 注意：这里调用 updateDesignData 会导致组件重渲染，
        // 但因为 useEffect 被 hasInitialized 锁住了，所以不会触发死循环。
        updateDesignData('modeDetails', newlyExtractedDetails);
        
        // 2. 检查完整性
        const requiredKeys = ['strategy1', 'strategy2', 'strategy3'];
        
        const currentDetails = { 
            ...designData.modeDetails, 
            ...newlyExtractedDetails      
        };
        
        const allFieldsCollected = requiredKeys.every(key => 
            currentDetails[key] != null && currentDetails[key].trim() !== ''
        );
        
        // 3. 如果完整，则标记完成
        if (allFieldsCollected) {
            setIsTaskComplete(true);
            // 这里可以选择是否自动跳转，或者让用户点击按钮
            // handleNextPage(); 
        }
    }
  };

  const handleTaskComplete = (data) => {
    // 这是一个来自 ChatDialog 的回调（如果后端返回 isTaskComplete: true）
    setIsTaskComplete(true);
    handleNextPage();
  };

  const handleNextPage = () => {
    completeStage(6); 
    setIsSumOpen(true); 
  };

  const handleCloseSum = (entryPoint) => {
    setIsSumOpen(false);
    if (entryPoint === 'page15Next') {
      setTimeout(() => {
        navigate('/achieve'); 
      }, 50); 
    }
  };

  if (!designData.modeCard) return null;
  
  const selectedCard = cards.find(card => card.name === designData.modeCard);
  if (!selectedCard) return null;

  const modeDetailsFields = [
    { label: '策略 1', value: designData.modeDetails?.strategy1, placeholder: '待补充具体实现方式...' },
    { label: '策略 2', value: designData.modeDetails?.strategy2, placeholder: '待补充具体实现方式...' },
    { label: '策略 3', value: designData.modeDetails?.strategy3, placeholder: '待补充具体实现方式...' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          <OverlayCard 
            backgroundImageUrl={selectedCard.image}
            fields={modeDetailsFields}
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
        {isSumOpen && (
          <Page16_Sum 
            isOpen={isSumOpen}
            onClose={handleCloseSum}
            entryPoint="page15Next"
          />
        )}
      </div>

      <div className={styles.rightPanel}>
        {/* 【修复】移除了 key={initialBotMessage}，防止组件销毁重建 */}
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

export default Page15_2;