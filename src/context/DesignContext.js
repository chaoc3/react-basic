import React, { createContext, useState, useContext, useCallback } from 'react';

// 1. Create the context
const DesignContext = createContext();

// 2. Create a Provider component
export const DesignProvider = ({ children }) => {
  // This state will hold all the data from the entire flow
  const [designData, setDesignData] = useState({
    /* targetUser: "需要长期自我管理血糖的年轻糖尿病患者",       
    
    targetPainpoint: "难以坚持每日测量血糖",  // 模拟 Page 4
    targetStage: "行为促进阶段",   */
    targetUser: null,       
    
    targetPainpoint: null,  // 模拟 Page 4
    targetStage: null,
    userProfile: {
      age: null,
      sexual: null,
      edu: null,
      work: null,
      equip: null,
    },    // From Page 5
    userCard: null,         // From Page 6 (e.g., { id: 1, name: '慢病患者' })
    userDetails: null,      // From Page 7 (e.g., { age: 25, gender: 'Male' })
    scenarioCard: null,     // From Page 8
    scenarioDetails: null,  // From Page 9
    mechanismCards: [],     // From Page 10 (can be multiple)
    mechanismDetails: {},   // From Page 11
    infoSourceCards: [],    // From Page 12
    infoSourceDetails: {},  // From Page 13
    modeCard: null,         // From Page 14
    modeDetails: {},        // From Page 15
  });

  // A single function to update any part of the design data
  const updateDesignData = useCallback((key, value) => {
    setDesignData(prevData => {
      // 如果 key 是 userProfile，则合并对象
      if (key === 'userProfile') {
        return {
          ...prevData,
          userProfile: { ...prevData.userProfile, ...value },
        };
      }
      // 否则，直接更新
      return { ...prevData, [key]: value };
    });
  }, []);


  // The value provided to consuming components
  const value = { designData, updateDesignData };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};

// 3. Create a custom hook for easy access to the context
export const useDesign = () => {
  return useContext(DesignContext);
};