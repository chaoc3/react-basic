import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService'; 

// 组件导入
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import OverlayCard from '../components/OverlayCard';

// 资源导入
import Mec1 from '../assets/卡片背面/Mec-1-2.png';
import Mec2 from '../assets/卡片背面/Mec-2-2.png';
import Mec3 from '../assets/卡片背面/Mec-3-2.png';
import Mec4 from '../assets/卡片背面/Mec-4-2.png';
import Mec5 from '../assets/卡片背面/Mec-5-2.png';
import Mec6 from '../assets/卡片背面/Mec-6-2.png';
import Mec7 from '../assets/卡片背面/Mec-7-2.png';
import Mec8 from '../assets/卡片背面/Mec-8-2.png';
import ArrowLeft from '../assets/网页素材/向左.svg';
import ArrowRight from '../assets/网页素材/向右.svg';
import NextButtonSVG from '../assets/页面剩余素材/Next按钮.svg';

import styles from './styles/Page11_Mec_2.module.css';

const CURRENT_STAGE_ID = 4;

const allCards = [
  { id: 1, image: Mec1, name: '情景感知提醒' },
  { id: 2, image: Mec2, name: '反馈与激励' },
  { id: 3, image: Mec3, name: '决策简化' },
  { id: 4, image: Mec4, name: '社会影响' },
  { id: 5, image: Mec5, name: '认知重建与反思' },
  { id: 6, image: Mec6, name: '目标设定' },
  { id: 7, image: Mec7, name: '激发好奇心' },
  { id: 8, image: Mec8, name: '诱饵效应' },
];

const Page11_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGlobalComplete, setIsGlobalComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("");

  // 1. 过滤出用户在 Page 10 选择的卡片
  const selectedCards = useMemo(() => {
    const selectedNames = Array.isArray(designData.mechanismCards) 
      ? designData.mechanismCards 
      : [];
    return allCards.filter(card => selectedNames.includes(card.name));
  }, [designData.mechanismCards]);

  const currentCard = selectedCards[currentIndex];

  // 2. 【关键】实时获取当前卡片的详情
  // 只要 updateDesignData 更新了 Context，这里就会重新计算，OverlayCard 就会刷新
  const currentCardDetails = useMemo(() => {
    if (!currentCard) return {};
    return designData.mechanismDetails?.[currentCard.name] || {};
  }, [designData.mechanismDetails, currentCard]);

  useEffect(() => {
    setActiveStageId(CURRENT_STAGE_ID);
  }, [setActiveStageId]);

  // 3. 检查完成状态
  useEffect(() => {
    if (selectedCards.length === 0) return;
    const allComplete = selectedCards.every(card => {
      const details = designData.mechanismDetails?.[card.name];
      return details && details.strategy1 && details.strategy2 && details.strategy3;
    });
    setIsGlobalComplete(allComplete);
  }, [designData.mechanismDetails, selectedCards]);

  // 4. 切换卡片时，触发 AI 开场白
  useEffect(() => {
    const triggerAiForCurrentCard = async () => {
      if (!currentCard) return;
      
      // 先设置一个临时的加载消息，防止 UI 空白
      setInitialBotMessage(`正在分析“${currentCard.name}”的策略...`);

      try {
        const aiResult = await getAiResponse(
          [], 
          'buildMechanismDetails',
          { 
            mechanismCards: designData.mechanismCards,
            mechanismDetails: designData.mechanismDetails,
            currentCardName: currentCard.name,
            targetUser: designData.targetUser,
            targetStage: designData.targetStage,
          }
        );
        setInitialBotMessage(aiResult.responseText);
      } catch (error) {
        console.error("AI Error:", error);
        setInitialBotMessage(`请为“${currentCard.name}”制定具体的实施策略。`);
      }
    };

    if (selectedCards.length > 0) {
      triggerAiForCurrentCard();
    }
  }, [currentIndex, currentCard]); // 依赖 currentIndex 变化

  // 5. 【核心逻辑】处理数据提取
  const handleDataExtracted = (data) => {
    // 只有当后端返回了 mechanismDetails 时才处理
    if (data?.mechanismDetails && currentCard) {
      console.log("前端接收到提取数据:", data.mechanismDetails);
      
      // 获取旧数据
      const existingDetails = designData.mechanismDetails?.[currentCard.name] || {};
      // 合并新数据
      const mergedDetails = { ...existingDetails, ...data.mechanismDetails };
      
      // 更新 Context -> 这会触发 currentCardDetails 更新 -> 触发 OverlayCard 更新
      updateDesignData('mechanismDetails', {
        [currentCard.name]: mergedDetails
      });
    }
  };

  // 6. 【核心逻辑】发送消息并立即处理反馈
  const handleSendMessage = async (userInput, currentMessages) => {
    try {
      const aiResult = await getAiResponse(
        [...currentMessages, { sender: 'user', text: userInput }],
        'buildMechanismDetails', 
        { 
          mechanismCards: designData.mechanismCards,
          mechanismDetails: designData.mechanismDetails,
          currentCardName: currentCard?.name,
          targetUser: designData.targetUser,
          targetStage: designData.targetStage,
        }
      );

      // 【关键】在返回给 ChatDialog 之前，先检查并更新数据
      // 这样当用户看到 AI 回复时，卡片上的字已经填上去了
      if (aiResult.extractedData) {
        handleDataExtracted(aiResult.extractedData);
      }

      return aiResult; // 返回给 ChatDialog 显示文本
    } catch (error) {
      console.error("Send Message Error:", error);
      return { responseText: "抱歉，网络似乎有点问题，请重试。" };
    }
  };

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? selectedCards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === selectedCards.length - 1 ? 0 : prev + 1));

  const handleNextPage = () => {
    if (isGlobalComplete) {
      completeStage(CURRENT_STAGE_ID);
      navigate('/page12');
    }
  };

  const getCardClass = (index) => {
    const classes = [styles.card];
    const total = selectedCards.length;

    if (total === 1) {
      classes.push(styles.active);
      return classes.join(' ');
    }

    const prevIndex = currentIndex === 0 ? total - 1 : currentIndex - 1;
    const nextIndex = currentIndex === total - 1 ? 0 : currentIndex + 1;

    if (index === currentIndex) classes.push(styles.active);
    else if (index === prevIndex) classes.push(styles.prev);
    else if (index === nextIndex) classes.push(styles.next);
    else classes.push(styles.hidden);

    return classes.join(' ');
  };

  // 准备传给 OverlayCard 的字段
  // 这里直接读取 currentCardDetails，它是响应式的
  const mechanismFields = [
    { label: `策略 1`, value: currentCardDetails?.strategy1 ?? '', placeholder: `待补充...` },
    { label: `策略 2`, value: currentCardDetails?.strategy2 ?? '', placeholder: `待补充...` },
    { label: `策略 3`, value: currentCardDetails?.strategy3 ?? '', placeholder: `待补充...` },
  ];

  if (selectedCards.length === 0) return <div>请先在上一页选择卡片</div>;

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.cardCarousel}>
          <button onClick={handlePrev} className={styles.arrowButton}>
            <img src={ArrowLeft} alt="上一张" />
          </button>
          <div className={styles.cardContainer}>
            {selectedCards.map((card, index) => (
              <div key={card.id} className={getCardClass(index)}>
                <OverlayCard 
                    backgroundImageUrl={card.image}
                    // 只有当前正中间的卡片才显示输入框
                    fields={index === currentIndex ? mechanismFields : []} 
                />
              </div>
            ))}
          </div>
          <button onClick={handleNext} className={styles.arrowButton}>
            <img src={ArrowRight} alt="下一张" />
          </button>
        </div>
        
        <button 
          className={styles.nextButton} 
          onClick={handleNextPage} 
          disabled={!isGlobalComplete}
          style={{ 
            opacity: isGlobalComplete ? 1 : 0.5, 
            cursor: isGlobalComplete ? 'pointer' : 'not-allowed' 
          }}
        >
          <img src={NextButtonSVG} alt="下一步" />
        </button>
      </div>
      <div className={styles.rightPanel}>
        {/* key={currentCard.name} 确保切换卡片时，聊天记录清空并显示新的 initialBotMessage */}
        <ChatDialog 
          key={currentCard?.name} 
          initialBotMessage={initialBotMessage}
          getAiResponse={handleSendMessage} 
          // onDataExtracted={handleDataExtracted} // 这里可以不传，因为我们在 handleSendMessage 里手动调用了
        />
      </div>
    </div>
  );
};

export default Page11_2;