
// src/pages/Page3_Target-User.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page3_Target-User.module.css';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import ArrowButton from '../components/ArrowButton';
import backgroundForPage from '../assets/页面剩余素材/Page345页面.svg';  // <-- IMPORT your new component

// (The mockLlmApi function remains the same...)
const mockLlmApi = async (userInput) => {
  console.log("向模拟API发送:", userInput);
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (userInput.includes('慢病') || userInput.includes('患者') || userInput.includes('老人')) {
    return {
      responseText: '明白了，我已经了解你想聚焦的问题，这个方向很有意义。接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。点击右侧按钮进入下一步吧。',
      extractedData: { 'Target-User': userInput }
    };
  }
  return {
    responseText: '听起来很有趣，可以再具体描述一下他们是谁，正在经历什么吗？',
    extractedData: null
  };
};


const Page4_TargetPainpoint = () => {
  const navigate = useNavigate();
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [extractedUserData, setExtractedUserData] = useState(null);

  const handleDataExtracted = (data) => {
    console.log("任务完成，提取到的数据:", data);
    setExtractedUserData(data);
    setIsTaskComplete(true);
  };
  
  const handleNext = () => {
    navigate('/target-stage', { state: { userData: extractedUserData } });
  };

  return (
    <div className={styles.pageContainer}
    style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <BranchSelector />

      <div className={styles.chatWrapper}>
        <ChatDialog 
          initialBotMessage="你希望这个智能代理协助的助推机制想改变的问题是什么？"
          onSendMessage={mockLlmApi}
          onDataExtracted={handleDataExtracted}
        />
      </div>

      {/* RENDER your new component here. No more inline definitions! */}
      <ArrowButton onClick={handleNext} disabled={!isTaskComplete} />
    </div>
  );
};

export default Page4_TargetPainpoint;