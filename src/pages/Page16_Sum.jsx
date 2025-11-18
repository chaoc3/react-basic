// src/pages/Page16_Sum.js

import React from 'react';
import styles from './styles/Page16_Sum.module.css';
import background from '../assets/页面剩余素材/Page6-展开页面.svg';
import closeIcon from '../assets/页面剩余素材/Page16按钮.svg';

// --- ▼▼▼ 关键修改 ▼▼▼ ---
import { useDesign } from '../context/DesignContext'; 
import { useTimeline } from '../context/TimelineContext'; // 1. 导入 Timeline Hook
import { cardAssets } from '../assets/cardAssets'; // 2. 导入我们创建的卡片资产库
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
  // 4. 创建一个新的辅助函数，专门用于渲染已选择的卡片
  const renderSelectedCards = (stageId) => {
    const cardIdsSet = selectedCards[stageId];
  
    if (!cardIdsSet || cardIdsSet.size === 0) {
      return <span className={styles.placeholder}>尚未选择</span>;
    }
  
    return Array.from(cardIdsSet).map(cardId => {
      // ▼▼▼ 主要修改区域 ▼▼▼
  
      // 1. 从资产库获取的是图片 URL，而不是组件
      const cardImageUrl = cardAssets[stageId]?.[cardId];
      
      // 如果找不到图片 URL，则不渲染
      if (!cardImageUrl) {
        console.warn(`Card asset not found for stageId: ${stageId}, cardId: ${cardId}`);
        return null; 
      }
  
      // 2. 返回一个 <img> 标签来显示 PNG 图片
      return (
        <div key={cardId} className={styles.summaryCard}>
          <img 
            src={cardImageUrl} 
            alt={`已选卡片 ${cardId}`} 
            className={styles.summaryCardImage} // 添加一个新类名用于样式控制
          />
        </div>
      );
      // ▲▲▲ 修改结束 ▲▲▲
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