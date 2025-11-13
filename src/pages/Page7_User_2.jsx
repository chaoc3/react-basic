// src/pages/Page7_User_2.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService'; 
import OverlayCard from '../components/OverlayCard'; 
// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
// MODIFICATION 1: 导入用户画像卡片的背面 PNG
import CardUser1Back from '../assets/卡片背面/User-1-2.png';
import CardUser2Back from '../assets/卡片背面/User-2-2.png';
import CardUser3Back from '../assets/卡片背面/User-3-2.png';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg';

// CSS Module Import
import styles from './styles/Page7_User_2.module.css';

// MODIFICATION 2: 定义卡片数据，用于匹配名称和 PNG 资源
const userCards = [
  { name: '慢病患者', image: CardUser1Back },
  { name: '健康风险人群', image: CardUser2Back },
  { name: '心理健康群体', image: CardUser3Back },
];

// 假设你有一个 UserProfileCard 组件来显示画像信息
// 由于你要求直接渲染 PNG，我们暂时不使用这个组件，而是直接在 JSX 中渲染图片和文本
// 如果你需要一个组件来显示画像信息，请确保它能接收 profileData 和 cardName

const Page7_User_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析用户信息，请稍候...");

  // 查找当前选中的卡片图片
  const selectedUserCard = userCards.find(card => card.name === designData.user);
  const userProfileFields = [
    { label: '年龄', value: designData.userProfile.age, placeholder: '待补充...' },
    { label: '性别', value: designData.userProfile.sexual, placeholder: '待补充...' },
    { label: '教育背景', value: designData.userProfile.edu, placeholder: '待补充...' },
    { label: '职业类型', value: designData.userProfile.work, placeholder: '待补充...' },
    { label: '设备熟练度', value: designData.userProfile.equip, placeholder: '待补充...' },
  ];
  // Function to start the AI conversation (unchanged)
  const startProfileBuilding = useCallback(async () => {
    if (designData.targetUser && designData.user) {
      const aiResult = await getAiResponse(
        [], 
        'buildUserProfile', 
        { 
          targetUser: designData.targetUser,
          user: designData.user 
        }
      );
      
      setInitialBotMessage(aiResult.responseText);
      
      if (aiResult.extractedData && aiResult.extractedData.userProfile) {
        updateDesignData('userProfile', aiResult.extractedData.userProfile);
      }
      
      if (aiResult.isTaskComplete) {
        setIsTaskComplete(true);
      }

    } else {
      console.warn("Missing targetUser or user data, redirecting to /page6.");
      navigate('/page6');
    }
  }, [designData.targetUser, designData.user, navigate, updateDesignData]);

  useEffect(() => {
    setActiveStageId(2); 
    startProfileBuilding();
  }, [setActiveStageId, startProfileBuilding]);

  // Function to handle sending a user's message to the AI backend (unchanged)
  const handleSendMessage = async (userInput, currentMessages) => {
    const messagesForApi = [...currentMessages, { sender: 'user', text: userInput }];
    
    const aiResult = await getAiResponse(
      messagesForApi,
      'buildUserProfile',
      { 
        targetUser: designData.targetUser,
        user: designData.user,
        // 关键修改：将当前已有的画像数据也传给后端，供后端判断是否收集完毕
        userProfile: designData.userProfile 
      }
    );
    return aiResult; 
};

  // Callback for when the AI extracts new data (unchanged)
  const handleDataExtracted = (data) => {
    if (data && data.userProfile) {
      console.log("Extracted new user profile data:", data.userProfile);
      updateDesignData('userProfile', data.userProfile);
    }
  };

  // Callback for when the AI signals that the task is fully complete (unchanged)
  const handleTaskComplete = (data) => {
    console.log("AI has confirmed: user profile task is complete.");
    if (data && data.userProfile) {
        updateDesignData('userProfile', data.userProfile);
    }
    setIsTaskComplete(true);
    
    setTimeout(() => {
        handleNextPage();
    }, 1500);
  };

  // Function to navigate to the next page (unchanged)
  const handleNextPage = () => {
    completeStage(2); 
    navigate('/page8'); 
  };

  // Render nothing if data is missing or card is not found
  if (!designData.targetUser || !designData.user || !selectedUserCard) {
    return null;
  }

  // MODIFICATION 3: 渲染逻辑 - 直接渲染 PNG 图片和画像信息
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          {/* 渲染卡片背面 PNG */}
          <OverlayCard 
            backgroundImageUrl={selectedUserCard.image}
            fields={userProfileFields}
          />
{/*           <div className={styles.card}>
            <img 
              src={selectedUserCard.image} 
              alt={selectedUserCard.name} 
              className={styles.cardImage} 
            />

          </div> */}
        </div>
        <button 
          className={styles.nextButton} 
          onClick={handleNextPage}
          disabled={!isTaskComplete} 
        >
          <NextButtonSVG />
        </button>
      </div>

      <div className={styles.rightPanel}>
        <ChatDialog
          key={initialBotMessage} 
          initialBotMessage={initialBotMessage}
          getAiResponse={handleSendMessage}
          onDataExtracted={handleDataExtracted}
          onTaskComplete={handleTaskComplete}
        />
      </div>
    </div>
  );
};

export default Page7_User_2;