const mockApiCall = (userInput, mockResponse) => {
    console.log("Simulating API call with input:", userInput);
    return new Promise(resolve => {
      const delay = Math.random() * 1500 + 500; // 500ms to 2000ms delay
      setTimeout(() => {
        console.log("Simulated API response:", mockResponse);
        resolve({ success: true, token: mockResponse });
      }, delay);
    });
  };
  
  // Page 3: 从用户描述中提取目标用户 token
  export const determineTargetUser = async (userInput) => {
    // 【API 对接点】
    // 在这里替换为真实的 fetch 或 axios 调用
    // const response = await fetch('YOUR_LLM_ENDPOINT/getTargetUser', {
    //   method: 'POST',
    //   body: JSON.stringify({ prompt: userInput })
    // });
    // const data = await response.json();
    // return data;
  
    // 当前使用模拟数据
    return mockApiCall(userInput, "2型糖尿病的年轻上班族");
  };
  
  // Page 4: 从用户描述中提取设计痛点 token
  export const determinePainPoint = async (userInput) => {
    // 【API 对接点】
    return mockApiCall(userInput, "难以坚持健康的饮食计划");
  };
  
  // Page 5: 从用户描述中提取行为阶段 token
  export const determineStage = async (userInput) => {
    // 【API 对接点】
    return mockApiCall(userInput, "行为促进阶段");
  };