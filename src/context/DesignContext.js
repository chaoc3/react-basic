// src/context/DesignContext.jsx

import React, { createContext, useState, useContext, useCallback } from 'react';

// 1. 创建一个完整的模拟数据对象
// 你可以根据需要修改这里的任何值来进行不同的测试
/* const mockDesignData = {
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
    strategy1: null,
    strategy2: null,
    strategy3: null,
  },
  infoSourceCards: [], // 从 Page 12 选择的卡片
  infoSourceDetails: {    
    strategy1: null,
    strategy2: null,
    strategy3: null,},
  modeCard: null, // 从 Page 14 选择的卡片
  modeDetails: {},
};
 */
const mockDesignData = {
  targetUser: '年轻上班族',
  targetPainpoint: '工作压力大，缺乏时间进行健康管理',
  targetStage: '健康意识初步形成阶段',
  user: {
    id: 1,
    name: '张小明',
    type: '职场新人',
    description: '25岁，互联网公司产品经理，工作繁忙但注重健康'
  },
  userProfile: {
    age: 25,
    sexual: '男',
    edu: '本科',
    work: '互联网产品经理',
    equip: '智能手机、智能手表',
  },
  scenarioCard: {
    id: 3,
    title: '工作日健康管理',
    description: '上班族在工作日的健康维护场景'
  },
  scenarioDetails: {
    when: '工作日晚上8点后',
    where: '家中或健身房',
    who: '独自或与朋友一起',
    situation: '下班后疲惫，需要放松和锻炼'
  },
  mechanismCards: [
    {
      id: 1,
      name: '游戏化激励',
      type: '激励机制'
    },
    {
      id: 2, 
      name: '社交互动',
      type: '社交机制'
    }
  ],
  mechanismDetails: {
    strategy1: '通过积分和徽章系统激励用户坚持运动',
    strategy2: '添加好友互动和排行榜功能增强社交动力',
    strategy3: '设置阶段性目标和小奖励保持用户参与度',
  },
  infoSourceCards: [
  ],
  infoSourceDetails: {    
    strategy1: '通过智能设备自动收集运动数据和生理指标',
    strategy2: '定期推送问卷调查收集用户主观感受',
    strategy3: '记录用户行为模式和使用习惯',
  },
  modeCard: {
    id: 1,
    name: '个性化推荐模式',
    description: '基于用户数据提供个性化健康建议'
  },
  modeDetails: {
    algorithm: '协同过滤推荐',
    frequency: '每日更新',
    customization: '支持手动调整推荐强度',
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