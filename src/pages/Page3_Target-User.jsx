// src/pages/Page3_Target-User.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page3_Target-User.module.css';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton'; // <-- IMPORT your new component
import backgroundForPage from '../assets/页面剩余素材/Page345页面.svg'; 
// (The mockLlmApi function remains the same...)
const mockLlmApi = async (userInput) => {
  console.log("向模拟API发送:", userInput);
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (userInput.includes('慢病') || userInput.includes('患者') || userInput.includes('老人')|| userInput.includes('a')) {
    return {
      responseText: '太好了，我们已经确定了你的设计对象。接下来，我想更了解你的设计出发点。请点击右侧按钮进入下一步吧。',
      extractedData: { 'Target-User': userInput }
    };
  }
  return {
    responseText: '听起来很有趣，可以再具体描述一下他们是谁，正在经历什么吗？',
    extractedData: null
  };
};


const Page3_TargetUser = () => {
  const navigate = useNavigate();
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [extractedUserData, setExtractedUserData] = useState(null);

  const handleDataExtracted = (data) => {
    console.log("任务完成，提取到的数据:", data);
    setExtractedUserData(data);
    setIsTaskComplete(true);
  };
  
  const handleNext = () => {
    navigate('/target-painpoint', { state: { userData: extractedUserData } });
  };

  return (
    <div className={styles.pageContainer}
        style={{ backgroundImage: `url(${backgroundForPage})` }}
    >
      <BranchSelector />

      <div className={styles.chatWrapper}>
        <ChatDialog 
          initialBotMessage="你希望这个智能代理来帮助什么样的用户群体呢？可以用一句话告诉我，他们是谁、正在经历什么。"
          onSendMessage={mockLlmApi}
          onDataExtracted={handleDataExtracted}
        />
      </div>

      {/* RENDER your new component here. No more inline definitions! */}
      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
    </div>
  );
};

export default Page3_TargetUser;