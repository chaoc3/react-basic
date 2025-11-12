// src/context/TimelineContext.js

import React, { createContext, useState, useContext, useCallback } from 'react';

// 1. 创建 Context
const TimelineContext = createContext();

// 2. 创建一个自定义 Hook，方便子组件使用 Context
export const useTimeline = () => useContext(TimelineContext);

// 3. 创建 Provider 组件
export const TimelineProvider = ({ children }) => {
  // 当前活动阶段的 ID
  const [activeStageId, setActiveStageId] = useState(1);
  
  // 已完成阶段的 ID 集合
  const [completedStages, setCompletedStages] = useState(new Set());
  
  // 每个阶段所选卡片的映射，例如 { stageId: Set(cardId1, cardId2) }
  const [selectedCards, setSelectedCards] = useState({});
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // 2. 创建打开和关闭的函数
  const openSummary = useCallback(() => setIsSummaryOpen(true), []);
  const closeSummary = useCallback(() => setIsSummaryOpen(false), []);
  // 完成一个阶段
  const completeStage = useCallback((stageId) => {
    setCompletedStages(prev => new Set(prev).add(stageId));
  }, []);

  // 选择一张卡片
  const selectCard = useCallback((stageId, cardId) => {
    setSelectedCards(prev => {
      // 1. 获取当前阶段已选择的卡片集合，如果不存在则创建一个新的
      const stageSelection = new Set(prev[stageId] || []);

      // 2. 检查卡片是否已存在
      if (stageSelection.has(cardId)) {
        stageSelection.delete(cardId); // 如果存在，则移除（取消选择）
      } else {
        stageSelection.add(cardId);    // 如果不存在，则添加（选择）
      }

      // 3. 返回更新后的状态
      return { ...prev, [stageId]: stageSelection };
    });
  }, []);

  const setSingleCard = useCallback((stageId, cardId) => {
    setSelectedCards(prev => {
      // 创建一个全新的 Set，只包含当前选择的 cardId
      const newSelection = new Set();
      if (cardId !== null) { // 确保 cardId 不是 null
        newSelection.add(cardId);
      }
      // 返回一个新状态，用这个全新的 Set 替换掉旧的
      return { ...prev, [stageId]: newSelection };
    });
  }, []);
  // --- ▲▲▲ 新增结束 ▲▲▲ ---
  // 暴露给子组件的值
  const value = {
    activeStageId,
    completedStages,
    selectedCards,
    setActiveStageId,
    completeStage,
    selectCard,
    isSummaryOpen,
    openSummary,
    closeSummary,
    setSingleCard,
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};