// src/pages/Page10_1.jsx

import Mec1 from '../assets/卡片/正面/Mec-1-1.png';
import Mec2 from '../assets/卡片/正面/Mec-2-1.png';
import Mec3 from '../assets/卡片/正面/Mec-3-1.png';
import Mec4 from '../assets/卡片/正面/Mec-4-1.png';
import Mec5 from '../assets/卡片/正面/Mec-5-1.png';
import Mec6 from '../assets/卡片/正面/Mec-6-1.png';
import Mec7 from '../assets/卡片/正面/Mec-7-1.png';
import Mec8 from '../assets/卡片/正面/Mec-8-1.png';
import Mec9 from '../assets/卡片/正面/Mec-9-1.png';
import ArrowLeft from '../assets/网页素材/向左.svg';
import ArrowRight from '../assets/网页素材/向右.svg';
import SelectButtonSVG from '../assets/页面剩余素材/Page68101214按钮.svg';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page10_Mec_1.module.css';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService';
import InfoButtonIcon  from '../assets/网页素材/设计策略按钮.png'; // 1. 打开弹窗的按钮图
import InfoContentImg  from '../assets/网页素材/助推机制.png'; // 2. 弹窗里显示的长图
import CloseIcon  from '../assets/页面剩余素材/总结页面关闭按钮.png'; // 3. 关闭按钮图

const cards = [
  { id: 1, src: Mec1, name: '情景感知提醒' },
  { id: 2, src: Mec2, name: '情感激励' },
  { id: 3, src: Mec3, name: '指导性反馈' },
  { id: 4, src: Mec4, name: '决策引导' },
  { id: 5, src: Mec5, name: '社会存在' },
  { id: 6, src: Mec6, name: '反思促进' },
  { id: 7, src: Mec7, name: '动态目标重建' },
  { id: 8, src: Mec8, name: '叙事化探索' },
  { id: 9, src: Mec9, name: '诱饵效应' },
];

const CURRENT_STAGE_ID = 4; // 对应 BranchSelector 中的紫色节点 (Stage 4)
const MAX_SELECTIONS = 3;

const Page10_1 = () => {
  const navigate = useNavigate();
  
  // 1. 【关键修改】引入 selectCard 用于更新时间轴状态
  const { setActiveStageId, completeStage, selectCard } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [initialBotMessage, setInitialBotMessage] = useState("正在思考如何为你推荐...");
  const [showInfoModal, setShowInfoModal] = useState(false);
  useEffect(() => {
    setActiveStageId(CURRENT_STAGE_ID);
  }, [setActiveStageId]);

  // 初始化：从 Context 同步到本地状态
  useEffect(() => {
    const mechanismNames = Array.isArray(designData.mechanismCards)
      ? designData.mechanismCards
      : [];

    if (mechanismNames.length > 0) {
      const ids = cards
        .filter(c => mechanismNames.includes(c.name))
        .map(c => c.id);
      
      setSelectedCardIds(prev => {
        if (JSON.stringify(prev.sort()) === JSON.stringify(ids.sort())) return prev;
        return ids;
      });
      
      // 注意：这里通常不需要在 useEffect 里调用 selectCard，
      // 因为 TimelineContext 应该已经持久化了之前的选择。
      // 如果刷新页面后时间轴丢失，可以在这里遍历 ids 调用 selectCard，但要小心死循环。
    }
  }, [designData.mechanismCards]);

  // AI 推荐逻辑
  useEffect(() => {
    const fetchRecommendation = async () => {
      if (designData.targetUser) {
        try {
          const aiResult = await getAiResponse([], 'recommendMechanisms', { ...designData });
          setInitialBotMessage(aiResult.responseText);
        } catch (error) {
          setInitialBotMessage("抱歉，推荐服务暂时无法连接。请直接从左侧选择一个用户画像。");
        }
      } else {
        setInitialBotMessage("让我们一起确定你的设计对象吧！请在左侧选择一个用户画像。");
      }
    };
    fetchRecommendation();
  }, [designData.targetUser]);

  // --- 点击处理逻辑 ---
  const handleCardClick = (cardId) => {
    const isSelected = selectedCardIds.includes(cardId);
    let newIds;
    const clickedCard = cards.find(c => c.id === cardId);

    if (isSelected) {
      // 取消选中
      newIds = selectedCardIds.filter(id => id !== cardId);
      
      // 2. 【关键修改】同步更新时间轴（取消选中）
      selectCard(CURRENT_STAGE_ID, cardId);

      // 3. 【新增】清理该卡片对应的 mechanismDetails
      // 注意：由于 updateDesignData 对 mechanismDetails 有特殊合并逻辑，
      // 我们需要先获取完整对象，删除对应项，然后整体替换
      if (clickedCard && designData.mechanismDetails?.[clickedCard.name]) {
        const updatedDetails = { ...designData.mechanismDetails };
        delete updatedDetails[clickedCard.name];
        // 使用 setDesignData 的方式，但通过 updateDesignData 的机制
        // 由于 updateDesignData 会合并，我们需要特殊处理
        // 这里我们直接更新整个 mechanismDetails 对象
        updateDesignData('mechanismDetails', updatedDetails);
      }

    } else {
      // 新增选中
      if (selectedCardIds.length >= MAX_SELECTIONS) {
        console.log(`最多只能选择 ${MAX_SELECTIONS} 张卡片`);
        return; // 超过限制，不执行任何操作
      }
      newIds = [...selectedCardIds, cardId];
      
      // 2. 【关键修改】同步更新时间轴（选中）
      selectCard(CURRENT_STAGE_ID, cardId);
    }

    // 更新本地 UI 状态
    setSelectedCardIds(newIds);

    // 更新全局 Design Context - mechanismCards
    const selectedNames = cards
      .filter(c => newIds.includes(c.id))
      .map(c => c.name);
    updateDesignData('mechanismCards', selectedNames);
  };

  const handleNextPage = () => {
    if (selectedCardIds.length > 0) {
      completeStage(CURRENT_STAGE_ID);
      navigate('/page11');
    }
  };

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));

  const getCardClass = (index) => {
    const classes = [styles.card];
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;

    if (index === currentIndex) classes.push(styles.active);
    else if (index === prevIndex) classes.push(styles.prev);
    else if (index === nextIndex) classes.push(styles.next);
    else classes.push(styles.hidden);
    
    if (selectedCardIds.includes(cards[index].id)) {
      classes.push(styles.selected);
    }
    return classes.join(' ');
  };

  const dummyGetAiResponse = async () => ({ responseText: "请在左侧选择卡片后点击下方的按钮继续。" });

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        <button 
          className={styles.infoTriggerButton} 
          onClick={() => setShowInfoModal(true)}
        >
          <img src={InfoButtonIcon} alt="查看详情" />
        </button>
        <div className={styles.cardCarousel}>
          <button onClick={handlePrev} className={styles.arrowButton}>
            <img src={ArrowLeft} alt="上一张" />
          </button>
          <div className={styles.cardContainer}>
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={getCardClass(index)}
                onClick={() => handleCardClick(card.id)}
              >
                <img src={card.src} alt={card.name} />
              </div>
            ))}
          </div>
          <button onClick={handleNext} className={styles.arrowButton}>
            <img src={ArrowRight} alt="下一张" />
          </button>
        </div>
        <button 
          className={styles.selectButton} 
          onClick={handleNextPage}
          disabled={selectedCardIds.length === 0} 
          style={{ 
            opacity: selectedCardIds.length === 0 ? 0.5 : 1, 
            cursor: selectedCardIds.length === 0 ? 'not-allowed' : 'pointer' 
          }}
        >
          <img src={SelectButtonSVG} alt="下一步" />
        </button>
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog
          key={initialBotMessage}
          initialBotMessage={initialBotMessage}
          getAiResponse={dummyGetAiResponse} 
        />
      </div>
      {showInfoModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentWrapper}>
            {/* 关闭按钮 */}
            <button 
              className={styles.closeModalButton} 
              onClick={() => setShowInfoModal(false)}
            >
              <img src={CloseIcon} alt="关闭" />
            </button>
            
            {/* 可滚动的图片容器 */}
            <div className={styles.scrollableContent}>
              <img src={InfoContentImg} alt="详细信息" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page10_1;