// src/services/aiService.js

/**
 * 与后端 AI 服务进行通信的通用函数
 * @param {Array} messages - 当前的对话历史
 * @param {string} task - 要执行的后端任务名称 (e.g., 'recommendUserGroup')
 * @param {Object} additionalData - 需要发送给后端的额外数据 (e.g., { targetUser: '...' })
 * @returns {Promise<Object>} - 返回包含 responseText 和 extractedData 的对象
 */
export const getAiResponse = async (messages, task, additionalData = {}) => {
  console.log(`[FRONTEND] Calling AI Service for task: ${task}`);

  const requestBody = {
    messages: messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    task: task,
    ...additionalData, // 将额外数据合并到请求体中
  };

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FRONTEND] API Error: ${response.status}`, errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[FRONTEND] Received from AI Service:`, data);
    return data; // 应该包含 responseText, extractedData, isTaskComplete

  } catch (error) {
    console.error("[FRONTEND] Critical error in getAiResponse:", error);
    return {
      responseText: "抱歉，网络连接或服务器似乎出了点问题，请稍后再试。",
      extractedData: null,
      isTaskComplete: false,
    };
  }
};