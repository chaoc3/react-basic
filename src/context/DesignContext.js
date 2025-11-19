// src/context/DesignContext.jsx

import React, { createContext, useState, useContext, useCallback } from 'react';

// 1. 创建一个完整的模拟数据对象
// 你可以根据需要修改这里的任何值来进行不同的测试
const mockDesignData = {
  targetUser: 'null',
  targetPainpoint: 'null',
  targetStage: 'null',
  user: null, // 从 Page 6 选择的卡片
  userProfile: {
    age: null,
    sexual: null,
    edu: null,
    work: null,
    equip: null,
  },
  scenarioCard: null, // 从 Page 8 选择的卡片
  scenarioDetails: {
    when: null,
    where: null,
    who: null,
  },
  mechanismCards: [], // 从 Page 10 选择的卡片
  mechanismDetails: {
  },
  infoSourceCards: [], // 从 Page 12 选择的卡片
  infoSourceDetails: {    
    strategy1: null,
    strategy2: null,
    strategy3: null,},
  modeCard: null, // 从 Page 14 选择的卡片
  modeDetails: {},
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