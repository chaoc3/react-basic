// src/context/DesignContext.jsx

import React, { createContext, useState, useContext, useCallback } from 'react';

// 1. 创建一个完整的模拟数据对象
// 你可以根据需要修改这里的任何值来进行不同的测试
const mockDesignData = {
  targetUser: "需要进行体重管理的年轻上班族",
  targetPainpoint: "因工作繁忙和疲劳导致的饮食不规律及缺乏运动动力",
  targetStage: "行为促进阶段",
  user: "健康风险人群", // 从 Page 6 选择的卡片
  userProfile: {
    age: "28岁",
    sexual: "男性",
    edu: "本科",
    work: "市场营销",
    equip: "非常熟练",
  },
  scenarioCard: "工作场景", // 从 Page 8 选择的卡片
  scenarioDetails: {
    when: "下班后决定晚餐时",
    where: "办公室",
    who: "独自一人",
  },
  mechanismCards: ["提醒和活动建议", "决策简化"], // 从 Page 10 选择的卡片
  mechanismDetails: {
    strategy1: "在晚餐前推送低卡路里食谱或健康外卖选项",
    strategy2: "在周末下午建议简单的居家锻炼活动",
    strategy3: "提供一键生成购物清单并跳转至购物应用的功能",
  },
  infoSourceCards: ["自我数据"], // 从 Page 12 选择的卡片
  infoSourceDetails: {
    strategy1: "追踪用户的体重和步数数据",
    strategy2: "所有食谱和健康建议均由专业营养师提供",
    strategy3: null, // 未选的卡片可以为 null
  },
  modeCard: "文本交互", // 从 Page 14 选择的卡片
  modeDetails: {
    strategy1: "通过移动应用向用户推送个性化的通知和消息",
    strategy2: "采用积极、鼓励的语气",
    strategy3: "结合简洁明了的数据图表",
  },
};


// 2. Create the context
const DesignContext = createContext();

// 3. Create a Provider component
export const DesignProvider = ({ children }) => {
  
  // 关键修改：使用 mockDesignData 初始化 state
  const [designData, setDesignData] = useState(mockDesignData);

  // updateDesignData 函数保持不变
  const updateDesignData = useCallback((key, value) => {
    setDesignData(prevData => {
      if (key === 'userProfile' || key === 'scenarioDetails' || key === 'mechanismDetails' || key === 'infoSourceDetails' || key === 'modeDetails') {
        return {
          ...prevData,
          [key]: { ...prevData[key], ...value },
        };
      }
      return { ...prevData, [key]: value };
    });
  }, []);


  const value = { designData, updateDesignData };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};

// 4. custom hook for easy access (保持不变)
export const useDesign = () => {
  return useContext(DesignContext);
};