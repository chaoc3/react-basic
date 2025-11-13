// src/pages/Page9_Scenario_2.jsx (Page 9)

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';

// PNG Asset Imports (卡片背面)
import CardScenario1 from '../assets/卡片背面/Scenario-1-2.png';
import CardScenario2 from '../assets/卡片背面/Scenario-2-2.png';
import CardScenario3 from '../assets/卡片背面/Scenario-3-2.png';
import CardScenario4 from '../assets/卡片背面/Scenario-4-2.png';
import CardScenario5 from '../assets/卡片背面/Scenario-5-2.png';
import CardScenario6 from '../assets/卡片背面/Scenario-6-2.png';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg'; 

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
// 假设你有一个 ScenarioDetailCard 组件来显示场景信息

import styles from './styles/Page9_Scenario_2.module.css'; 

// 场景卡片数据 (用于展示 PNG)
const cards = [
  { id: 1, component: <img src={CardScenario1} alt="居家场景" className={styles.cardImage} />, name: '居家场景' },
  { id: 2, component: <img src={CardScenario2} alt="工作场景" className={styles.cardImage} />, name: '工作场景' },
  { id: 3, component: <img src={CardScenario3} alt="户外场景" className={styles.cardImage} />, name: '户外场景' },
  { id: 4, component: <img src={CardScenario4} alt="医疗场景" className={styles.cardImage} />, name: '医疗场景' },
  { id: 5, component: <img src={CardScenario5} alt="社区场景" className={styles.cardImage} />, name: '社区场景' },
  { id: 6, component: <img src={CardScenario6} alt="多场景" className={styles.cardImage} />, name: '多场景' },
];

const Page9_Scenario_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析场景信息，请稍候...");

  // --- 1. 模拟 AI 引导逻辑 (Page 7 的逻辑) ---
  const startScenarioBuilding = useCallback(async () => {
    // 确保我们有 Page 8 的数据
    if (designData.scenarioCard) {
      // 实际应该调用 AI Service，这里使用 Dummy Message
      setInitialBotMessage(`让我们一起来丰富 **${designData.scenarioCard}** 场景的细节吧！请告诉我：什么时候这种情况最容易出现？在哪里发生？当时通常还有谁在你身边？`);
      
      // 模拟预填写数据（如果需要）
      // updateDesignData('scenarioDetails', { when: '早上', where: '厨房', who: '家人' });
      
      // 暂时设置为 false，等待用户输入
      setIsTaskComplete(false); 

    } else {
      console.warn("Missing scenarioCard data, redirecting to /page8.");
      navigate('/page8');
    }
  }, [designData.scenarioCard, navigate]);

  useEffect(() => {
    setActiveStageId(3); // Page 9 仍属于 Stage 3
    startScenarioBuilding();
  }, [setActiveStageId, startScenarioBuilding]);

  // --- 2. Dummy AI 交互函数 (Page 7 的逻辑) ---
  const dummyHandleSendMessage = async (userInput, currentMessages) => {
    console.log(`User input (Scenario Details): ${userInput}`);
    
    // 模拟 AI 提取数据并返回
    if (userInput.includes('早上') || userInput.includes('厨房')) {
        // 模拟数据提取
        const extractedData = { scenarioDetails: { when: '早上', where: '厨房', who: '家人' } };
        updateDesignData('scenarioDetails', extractedData.scenarioDetails);
        
        // 模拟任务完成
        setIsTaskComplete(true);
        
        return { 
            responseText: "太棒了，我们已经确定了场景细节！点击下一步继续吧。",
            extractedData: extractedData,
            isTaskComplete: true
        };
    }
    
    return { 
        responseText: "请告诉我更多关于时间、地点和人物的细节。",
        extractedData: null,
        isTaskComplete: false
    };
  };

  // --- 3. 任务完成和跳转逻辑 (Page 7 的逻辑) ---
  const handleTaskComplete = (data) => {
    console.log("AI has confirmed: scenario details task is complete.");
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
  
  // 根据 Context 中的名称找到对应的卡片 ID，以便渲染 PNG
  const selectedCard = cards.find(card => card.name === designData.scenarioCard);
  if (!selectedCard) return null;


  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          {/* 渲染 PNG 卡片背面 */}
          <div className={styles.card}>
            {selectedCard.component}
          </div>
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
          getAiResponse={dummyHandleSendMessage} // 使用 Dummy AI 函数
          onTaskComplete={handleTaskComplete}
          // onDataExtracted 可以在 dummyHandleSendMessage 内部直接调用 updateDesignData
        />
      </div>
    </div>
  );
};

export default Page9_Scenario_2;