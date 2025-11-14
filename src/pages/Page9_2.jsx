// src/pages/Page9_Scenario_2.jsx (Page 9)

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService'; 
// PNG Asset Imports (卡片背面)
import CardScenario1 from '../assets/卡片背面/Scenario-1-2.png';
import CardScenario2 from '../assets/卡片背面/Scenario-2-2.png';
import CardScenario3 from '../assets/卡片背面/Scenario-3-2.png';
import CardScenario4 from '../assets/卡片背面/Scenario-4-2.png';
import CardScenario5 from '../assets/卡片背面/Scenario-5-2.png';
import CardScenario6 from '../assets/卡片背面/Scenario-6-2.png';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg'; 
import OverlayCard from '../components/OverlayCard'; // 导入通用卡片组件
// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
// 假设你有一个 ScenarioDetailCard 组件来显示场景信息

import styles from './styles/Page9_Scenario_2.module.css'; 

// 场景卡片数据 (用于展示 PNG)
const cards = [
  { id: 1, image: CardScenario1, name: '居家场景' },
  { id: 2, image: CardScenario2, name: '工作场景' },
  { id: 3, image: CardScenario3, name: '户外场景' },
  { id: 4, image: CardScenario4, name: '医疗场景' },
  { id: 5, image: CardScenario5, name: '社区场景' },
  { id: 6, image: CardScenario6, name: '多场景' },
];

const Page9_Scenario_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析场景信息，请稍候...");

  // --- 1. AI 引导逻辑 (Page 7 的逻辑) ---
  const startScenarioBuilding = useCallback(async () => {
    if (designData.scenarioCard) {
      const aiResult = await getAiResponse(
        [], // 首次加载，空消息历史
        'buildScenarioDetails', // 任务名称
        { 
          targetUser: designData.targetUser,
          user: designData.user,
          scenarioCard: designData.scenarioCard,
          scenarioDetails: designData.scenarioDetails // 传递当前已有的细节
        }
      );
      
      setInitialBotMessage(aiResult.responseText);
      
      if (aiResult.extractedData && aiResult.extractedData.scenarioDetails) {
        updateDesignData('scenarioDetails', aiResult.extractedData.scenarioDetails);
      }
      
      if (aiResult.isTaskComplete) {
        setIsTaskComplete(true);
      }

    } else {
      console.warn("Missing scenarioCard data, redirecting to /page8.");
      navigate('/page8');
    }
  }, [designData.scenarioCard, designData.targetUser, designData.user, designData.scenarioDetails, navigate, updateDesignData]);

  useEffect(() => {
    setActiveStageId(3); // Page 9 仍属于 Stage 3
    startScenarioBuilding();
  }, [setActiveStageId, startScenarioBuilding]);

  // --- 2. AI 交互函数 (Page 7 的逻辑) ---
  const handleSendMessage = async (userInput, currentMessages) => {
    const messagesForApi = [...currentMessages, { sender: 'user', text: userInput }];
    
    const aiResult = await getAiResponse(
      messagesForApi,
      'buildScenarioDetails', // 任务名称
      { 
        targetUser: designData.targetUser,
        user: designData.user,
        scenarioCard: designData.scenarioCard,
        scenarioDetails: designData.scenarioDetails // 传递当前已有的细节
      }
    );
    return aiResult; 
  };

  // --- 3. 数据提取和任务完成逻辑 (Page 7 的逻辑) ---
  const handleDataExtracted = (data) => {
    if (data && data.scenarioDetails) {
        // 提取到新数据，合并到全局状态
        updateDesignData('scenarioDetails', data.scenarioDetails);
    }
  };

  const handleTaskComplete = (data) => {
    console.log("AI has confirmed: scenario details task is complete.");
    // 此时，data.isTaskComplete 应该为 true
    setIsTaskComplete(true);
    
    setTimeout(() => {
        handleNextPage();
    }, 1500);
  };


  const handleNextPage = () => {
    completeStage(3); 
    navigate('/page10'); // 跳转到 Page 10 (机制选择)
  };

  // 渲染逻辑
  if (!designData.scenarioCard) {
    return null;
  }
  
  // 根据 Context 中的名称找到对应的卡片
  const selectedCard = cards.find(card => card.name === designData.scenarioCard);
  if (!selectedCard) return null;

  // 构造 OverlayCard 需要的字段数据
  const scenarioDetailsFields = [
    { label: '时间', value: designData.scenarioDetails?.when, placeholder: '什么时候最容易出现？' },
    { label: '地点', value: designData.scenarioDetails?.where, placeholder: '通常在哪里做这件事？' },
    { label: '人物', value: designData.scenarioDetails?.who, placeholder: '当时通常还有谁在你身边？' },
  ];


  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          {/* 使用 OverlayCard 组件 */}
          <OverlayCard 
            backgroundImageUrl={selectedCard.image}
            fields={scenarioDetailsFields}
          />
        </div>
        <button 
          className={styles.nextButton} 
          onClick={handleNextPage}
          disabled={!isTaskComplete} // 按钮在 AI 任务完成前禁用
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

export default Page9_Scenario_2;