import React, { createContext, useState } from 'react';

// Create the context
export const DesignContext = createContext();

const DEBUG_STATE = {
    user: {
      cardId: 1, // 假装用户选择了 ID 为 1 的卡片
      cardName: '慢病患者 (来自调试数据)', // 假装卡片名已确定
      details: { role: '大学生 (来自调试数据)' }, // 假装聊天信息已提取
    },
    // 假设 Page5 应该设置 scenario，我们也可以在这里模拟
    scenario: {
        id: 2,
        name: "居家场景 (来自调试数据)"
    }
  };

// Create a Provider component
export const DesignProvider = ({ children }) => {
    // 3. 关键步骤：在这里切换使用哪个状态
    //    当你需要调试时，使用 DEBUG_STATE
    //    当你要正常运行整个流程时，换回 INITIAL_STATE
    const [designData, setDesignData] = useState(DEBUG_STATE); 
  
    const updateUserData = (userData) => {
      setDesignData(prevData => ({
        ...prevData,
        user: { ...prevData.user, ...userData },
      }));
    };
  
    return (
      // Provider 的 value 保持不变
      <DesignContext.Provider value={{ designData, updateUserData }}>
        {children}
      </DesignContext.Provider>
    );
  };