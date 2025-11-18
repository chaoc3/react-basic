// src/pages/Page15_Mod_2.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService'; // 导入 AI 服务

// PNG Asset Imports (卡片背面)
import CardMod1 from '../assets/卡片背面/Mod-1-2.png';
import CardMod2 from '../assets/卡片背面/Mod-2-2.png';
import CardMod3 from '../assets/卡片背面/Mod-3-2.png';
import CardMod4 from '../assets/卡片背面/Mod-4-2.png';
import NextButtonSVG from '../assets/页面剩余素材/Next按钮.svg'; 

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import OverlayCard from '../components/OverlayCard'; // 导入通用卡片组件
import Page16_Sum from './Page16_Sum';
import styles from './styles/Page15_Mod_2.module.css'; 

// 交互模态卡片数据 (用于展示 PNG)
const cards = [
  { name: '文本交互', image: CardMod1, keys: ['strategy1', 'strategy2', 'strategy3'] },
  { name: '语言交互', image: CardMod2, keys: ['strategy1', 'strategy2', 'strategy3'] },
  { name: '视觉交互', image: CardMod3, keys: ['strategy1', 'strategy2', 'strategy3'] },
  { name: '多模态交互', image: CardMod4, keys: ['strategy1', 'strategy2', 'strategy3'] },
];

const Page15_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析交互方式细节，请稍候...");
  const [isSumOpen, setIsSumOpen] = useState(false);

  // --- 1. AI 引导逻辑 ---
  const startDetailsBuilding = useCallback(async () => {
    if (designData.modeCard) {
      const aiResult = await getAiResponse(
        [], 
        'buildModeDetails', // 任务名称
        { 
          modeCard: designData.modeCard,
          modeDetails: designData.modeDetails
        }
      );
      
      setInitialBotMessage(aiResult.responseText);
      
      if (aiResult.extractedData && aiResult.extractedData.modeDetails) {
        updateDesignData('modeDetails', aiResult.extractedData.modeDetails);
      }
      
      if (aiResult.isTaskComplete) {
        setIsTaskComplete(true);
      }

    } else {
      console.warn("Missing modeCard data, redirecting to /page14.");
      navigate('/page14');
    }
  }, [designData.modeCard, designData.modeDetails, navigate, updateDesignData]);

  useEffect(() => {
    setActiveStageId(6); // Page 15 仍属于 Stage 6
    startDetailsBuilding();
  }, [setActiveStageId, startDetailsBuilding]);

  // --- 2. AI 交互函数 ---
  const handleSendMessage = async (userInput, currentMessages) => {
    const messagesForApi = [...currentMessages, { sender: 'user', text: userInput }];
    
    const aiResult = await getAiResponse(
      messagesForApi,
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
        updateDesignData('modeDetails', newlyExtractedDetails);
        
        // 2. 检查完整性
        const requiredKeys = ['strategy1', 'strategy2', 'strategy3']; // 总是需要 3 个策略
        
        // 获取合并后的最新数据
        const currentDetails = { 
            ...designData.modeDetails, 
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
        
        // 任务完成，直接打开总览
        handleNextPage();
    }
  };

  const handleNextPage = () => {
    completeStage(6); 
    setIsSumOpen(true); // 打开总览 Page 16
  };

  const handleCloseSum = (entryPoint) => {
    setIsSumOpen(false);
    if (entryPoint === 'page15Next') {
      setTimeout(() => {
        navigate('/achieve'); // 跳转到 Page 17
      }, 50); 
    }
  };

  // 渲染逻辑
  if (!designData.modeCard) {
    return null;
  }
  
  // 根据 Context 中的名称找到对应的卡片
  const selectedCard = cards.find(card => card.name === designData.modeCard);
  if (!selectedCard) return null;

  // 构造 OverlayCard 需要的字段数据
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
          {/* 渲染 OverlayCard 组件 */}
          <OverlayCard 
            backgroundImageUrl={selectedCard.image}
            fields={modeDetailsFields}
          />
        </div>
        <button 
          className={styles.nextButton} 
          onClick={handleNextPage}
          disabled={!isTaskComplete} // 按钮在 AI 任务完成前禁用
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

export default Page15_2;