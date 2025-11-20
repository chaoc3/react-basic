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
  "targetUser":null ,
  "targetPainpoint": null,
  "targetStage":null ,
  "user": null,
  "userProfile": {
    "age":null ,
    "sexual":null ,
    "edu": null,
    "work":null ,
    "equip": null
  },
  "scenarioCard":null ,
  "scenarioDetails": {
    "when":null,
    "where": null,
    "who":null ,
    "situation": null
  }, 
/*   "targetUser": "年轻上班族",
  "targetPainpoint": "工作压力大，缺乏时间进行健康管理",
  "targetStage": "健康意识初步形成阶段",
  "user": "张小明",
  "userProfile": {
    "age": "25",
    "sexual": "男",
    "edu": "本科",
    "work": "互联网产品经理",
    "equip": "智能手机、智能手表"
  },
  "scenarioCard": "工作日健康管理",
  "scenarioDetails": {
    "when": "工作日晚上8点后",
    "where": "家中或健身房",
    "who": "独自或与朋友一起",
    "situation": "下班后疲惫，需要放松和锻炼"
  }, */
/*   "mechanismCards": [
    "共情反馈"
  ],
  "mechanismDetails": {
    
      "strategy1": "在每日总结中加入情感化语言，强调系统理解用户的疲惫和努力。",
      "strategy2": "推送同龄人或同岗位用户的鼓励性反馈，营造“有人懂你”的氛围。",
      "strategy3": "当用户连续完成任务时，提供个性化的语音/图文安慰与庆祝。"
    
  }, */
  "mechanismCards":[

  ],
  "mechanismDetails": {
    "strategy1":null,
    "strategy2":null,
    "strategy3":null,
  },
/*   "infoSourceCards": [

  ],
  "infoSourceDetails": {
    "strategy1": "记录穿戴设备上传的睡眠时长、步数、心率",
    "strategy2": "邀请同事/朋友轻量化打分或留言，反馈用户状态",
    "strategy3": ""
  }, */
  "infoSourceCards": [

  ],
  "infoSourceDetails": {
    "strategy1": null,
    "strategy2": null,
    "strategy3": null
  },
/*   "modeCard": "个性化推荐模式",
  "modeDetails": {
    "strategy1": "协同过滤 + 时间分段推荐",
    "strategy2": "每日晚间推送简短提示卡片",
    "strategy3": "允许用户手动调整推荐强度"
  }, */
  "modeCard": null,
  "modeDetails": {
    "strategy1": null,
    "strategy2": null,
    "strategy3": null
  }

}


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