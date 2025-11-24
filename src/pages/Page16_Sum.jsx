// src/pages/Page16_Sum.js

import React from 'react';
import styles from './styles/Page16_Sum.module.css';
import background from '../assets/页面剩余素材/Page6-展开页面.svg';
import closeIcon from '../assets/页面剩余素材/总结页面关闭按钮.png';

// --- ▼▼▼ 关键修改 ▼▼▼ ---
import { useDesign } from '../context/DesignContext'; 
import { useTimeline } from '../context/TimelineContext'; // 1. 导入 Timeline Hook
import { cardAssets } from '../assets/cardAssets'; // 2. 导入我们创建的卡片资产库
import OverlayCard from '../components/OverlayCard'; // 3. 导入 OverlayCard 组件
// --- ▲▲▲ 修改结束 ▲▲▲ ---

const Page16_Sum = ({ isOpen, onClose, entryPoint }) => {
  const { designData } = useDesign(); // 用于获取文本数据
  const { selectedCards } = useTimeline(); // 3. 从 Timeline Context 获取已选卡片数据

  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  // 这是一个辅助函数，用于渲染文本数据（您的原始代码）
  const renderData = (data, placeholder = '尚未确定') => {
    // 确保 data 存在且不为空字符串
    return data && String(data).trim() !== '' ? data : <span className={styles.placeholder}>{placeholder}</span>;
  };

  // --- ▼▼▼ 关键新增 ▼▼▼ ---
  // 4. 卡片名称映射（根据 cardId 获取卡片名称）
  const getCardName = (stageId, cardId) => {
    const cardNameMap = {
      2: { 1: '慢病患者', 2: '健康风险人群', 3: '心理健康群体' }, // User
      3: { 1: '居家场景', 2: '工作场景', 3: '户外场景', 4: '医疗场景', 5: '社区场景', 6: '多场景' }, // Scenario
      4: { 1: '情景感知提醒', 2: '共情反馈', 3: '决策引导', 4: '社会存在', 5: '反思促进', 6: '动态目标重建', 7: '叙事化探索', 8: '诱饵效应' }, // Mechanism (names aligned with Page11)
      5: { 1: '自我数据', 2: '他人影响', 3: '专家干预' }, // Info Source
      6: { 1: '文本交互', 2: '语言交互', 3: '视觉交互', 4: '多模态交互' }, // Mode
    };
    return cardNameMap[stageId]?.[cardId] || null;
  };

  // 5. 根据 stageId 和 cardName 获取对应的字段配置
  const getFieldsForStage = (stageId, cardName = null) => {
    switch (stageId) {
      case 2: // User
        return [
          { label: '年龄', value: designData.userProfile?.age, placeholder: '待补充...' },
          { label: '性别', value: designData.userProfile?.sexual, placeholder: '待补充...' },
          { label: '教育背景', value: designData.userProfile?.edu, placeholder: '待补充...' },
          { label: '职业类型', value: designData.userProfile?.work, placeholder: '待补充...' },
          { label: '设备熟练度', value: designData.userProfile?.equip, placeholder: '待补充...' },
        ];
      case 3: // Scenario
        return [
          { label: '时间', value: designData.scenarioDetails?.when, placeholder: '什么时候最容易出现？' },
          { label: '地点', value: designData.scenarioDetails?.where, placeholder: '通常在哪里做这件事？' },
          { label: '人物', value: designData.scenarioDetails?.who, placeholder: '当时通常还有谁在你身边？' },
        ];
      case 4: // Mechanism - 需要根据卡片名称获取对应的详细信息
        if (cardName && designData.mechanismDetails?.[cardName]) {
          const cardDetails = designData.mechanismDetails[cardName];
          return [
            { label: '策略 1', value: cardDetails.strategy1, placeholder: '待补充...' },
            { label: '策略 2', value: cardDetails.strategy2, placeholder: '待补充...' },
            { label: '策略 3', value: cardDetails.strategy3, placeholder: '待补充...' },
          ];
        }
        return [
          { label: '策略 1', value: null, placeholder: '待补充...' },
          { label: '策略 2', value: null, placeholder: '待补充...' },
          { label: '策略 3', value: null, placeholder: '待补充...' },
        ];
      case 5: // Info Source
        return [
          { label: '可以追踪的数据点', value: designData.infoSourceDetails?.strategy1, placeholder: '可以追踪的数据点' },
          { label: '可以追踪的数据点', value: designData.infoSourceDetails?.strategy2, placeholder: '可以追踪的数据点' },
          { label: '可以追踪的数据点', value: designData.infoSourceDetails?.strategy3, placeholder: '可以追踪的数据点' },
        ];
      case 6: // Mode
        return [
          { label: '策略 1', value: designData.modeDetails?.strategy1, placeholder: '待补充...' },
          { label: '策略 2', value: designData.modeDetails?.strategy2, placeholder: '待补充...' },
          { label: '策略 3', value: designData.modeDetails?.strategy3, placeholder: '待补充...' },
        ];
      default:
        return [];
    }
  };

  // 6. 创建一个新的辅助函数，专门用于渲染已选择的卡片（使用 OverlayCard）
  const renderSelectedCards = (stageId) => {
    const cardIdsSet = selectedCards[stageId];
  
    if (!cardIdsSet || cardIdsSet.size === 0) {
      return <span className={styles.placeholder}>尚未选择</span>;
    }
  
    return Array.from(cardIdsSet).map(cardId => {
      // 从资产库获取图片 URL
      const cardImageUrl = cardAssets[stageId]?.[cardId];
      
      // 如果找不到图片 URL，则不渲染
      if (!cardImageUrl) {
        console.warn(`Card asset not found for stageId: ${stageId}, cardId: ${cardId}`);
        return null; 
      }

      // 获取卡片名称（用于 Mechanism 等需要根据卡片名称获取详细信息的 stage）
      const cardName = getCardName(stageId, cardId);
      
      // 获取该 stage 和卡片对应的字段配置
      const fields = getFieldsForStage(stageId, cardName);
  
      // 使用 OverlayCard 组件来显示卡片和叠加信息
      return (
        <div key={cardId} className={styles.summaryCard}>
          <OverlayCard 
            backgroundImageUrl={cardImageUrl}
            fields={fields}
          />
        </div>
      );
    });
  };
  // --- ▲▲▲ 新增结束 ▲▲▲ ---

  const handleClose = () => onClose(entryPoint);

  return (
    <div className={styles.overlay}>
      <button onClick={handleClose} className={styles.closeButton}>
        <img src={closeIcon} alt="Close" />
      </button>

      <div className={styles.content}>
        <img src={background} alt="Design Summary Background" className={styles.backgroundImage} />
        <div className={styles.textOverlay}>
          
          {/* --- ▼▼▼ 关键修改：更新每个区块的内容 ▼▼▼ --- */}

          {/* Design Target Section (主要显示文本) */}
          <div className={`${styles.section} ${styles.designTargetArea}`}>
            
            {/* 第一行: User */}
            <div className={styles.fieldGroup}>
             
              <div className={styles.dataContent}>
                {renderData(designData.targetUser)}
              </div>
            </div>

            {/* 第二行: Painpoint 和 Stage 的容器 */}
            <div className={styles.bottomFieldsContainer}>
              
              {/* Painpoint */}
              <div className={`${styles.fieldGroup} ${styles.halfWidth}`}>
                
                <div className={styles.dataContent}>
                  {renderData(designData.targetPainpoint)}
                </div>
              </div>

              {/* Stage */}
              <div className={`${styles.fieldGroup} ${styles.halfWidth}`}>
                
                <div className={styles.dataContent}>
                  {renderData(designData.targetStage)}
                </div>
              </div>

            </div>
          </div>

          {/* User Section (现在要显示卡片) */}
          <div className={styles.section}>
            {/* 我们不再需要 h3 和 p 标签，因为它们已经画在背景图上了 */}
            {/* <h3 >User</h3> */}
            {/* <p>...</p> */}
            {/* 1. 添加一个唯一的类名: styles.userCardArea */}
            <div className={`${styles.cardDisplayArea} ${styles.userCardArea}`}>
              {renderSelectedCards(2)}
            </div>
          </div>

          {/* Scenario Section */}
          <div className={styles.section}>
            {/* 2. 添加唯一的类名: styles.scenarioCardArea */}
            <div className={`${styles.cardDisplayArea} ${styles.scenarioCardArea}`}>
              {renderSelectedCards(3)}
            </div>
          </div>

          {/* Mechanism Section */}
          <div className={styles.section}>
            {/* 3. 添加唯一的类名: styles.mechanismCardArea */}
            <div className={`${styles.cardDisplayArea} ${styles.mechanismCardArea}`}>
              {renderSelectedCards(4)}
            </div>
          </div>

          {/* Info Source Section */}
          <div className={styles.section}>
            {/* 4. 添加唯一的类名: styles.infoSourceCardArea */}
            <div className={`${styles.cardDisplayArea} ${styles.infoSourceCardArea}`}>
              {renderSelectedCards(5)}
            </div>
          </div>

          {/* Mode Section */}
          <div className={styles.section}>
            {/* 5. 添加唯一的类名: styles.modeCardArea */}
            <div className={`${styles.cardDisplayArea} ${styles.modeCardArea}`}>
              {renderSelectedCards(6)}
            </div>
          </div>


          {/* --- ▲▲▲ 修改结束 ▲▲▲ --- */}

        </div>
      </div>
    </div>
  );
};

export default Page16_Sum;