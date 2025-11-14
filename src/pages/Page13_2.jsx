// src/pages/Page13_InfS_2.jsx (Page 13)

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService'; // 导入 AI 服务

// PNG Asset Imports (卡片背面)
import CardInfS1 from '../assets/卡片背面/InfS-1-2.png';
import CardInfS2 from '../assets/卡片背面/InfS-2-2.png';
import CardInfS3 from '../assets/卡片背面/InfS-3-2.png';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg'; 

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import OverlayCard from '../components/OverlayCard'; // 导入通用卡片组件
import styles from './styles/Page13_InfS_2.module.css'; 

// 场景卡片数据 (用于展示 PNG)
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

  // --- 1. AI 引导逻辑 ---
  const startDetailsBuilding = useCallback(async () => {
    if (designData.infoSourceCards.length > 0) {
      const aiResult = await getAiResponse(
        [], 
        'buildInfoSourceDetails', // 任务名称
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

    } else {
      console.warn("Missing infoSourceCards data, redirecting to /page12.");
      navigate('/page12');
    }
  }, [designData.infoSourceCards, designData.infoSourceDetails, navigate, updateDesignData]);

  useEffect(() => {
    setActiveStageId(5); // Page 13 仍属于 Stage 5
    startDetailsBuilding();
  }, [setActiveStageId, startDetailsBuilding]);

  // --- 2. AI 交互函数 ---
  const handleSendMessage = async (userInput, currentMessages) => {
    const messagesForApi = [...currentMessages, { sender: 'user', text: userInput }];
    
    const aiResult = await getAiResponse(
      messagesForApi,
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
        const requiredKeys = cards
            .filter(card => designData.infoSourceCards.includes(card.name))
            .map(card => card.key); // 找出所有已选卡片对应的 key (strategy1, strategy2...)
        
        // 获取合并后的最新数据
        const currentDetails = { 
            ...designData.infoSourceDetails, 
            ...newlyExtractedDetails      
        };
        
        // 检查所有已选信息源对应的 key 是否都有非空值
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
    navigate('/page14'); // 跳转到 Page 14 (交互模态选择)
  };

  // 渲染逻辑
  if (designData.infoSourceCards.length === 0) {
    return null;
  }
  
  // 构造 OverlayCard 需要的字段数据
  const infoSourceFields = cards
    .filter(card => designData.infoSourceCards.includes(card.name)) // 只保留已选中的卡片
    .map(card => ({
        label: card.name, // 使用卡片名称作为标签
        value: designData.infoSourceDetails?.[card.key], // 从 details 中获取对应的值
        placeholder: '待补充可追踪数据点...'
    }));

  // 渲染所有已选中的卡片 (多选卡片需要特殊布局，这里只渲染第一个作为示例)
  const firstSelectedCard = cards.find(card => designData.infoSourceCards.includes(card.name));
  if (!firstSelectedCard) return null;


  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          {/* 渲染第一个选中的卡片，并叠加所有已选信息源的细节 */}
          <OverlayCard 
            backgroundImageUrl={firstSelectedCard.image}
            fields={infoSourceFields}
          />
        </div>
        <button 
          className={styles.nextButton} 
          onClick={handleNextPage}
          disabled={!isTaskComplete} 
        >
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

export default Page13_2;