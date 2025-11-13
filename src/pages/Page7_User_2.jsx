import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext';
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService';

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import UserProfileCard from '../components/UserProfileCard';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg';

// CSS Module Import
import styles from './styles/Page7_User_2.module.css';

const Page7_User_2 = () => {
  const navigate = useNavigate();
  const { setActiveStageId, completeStage } = useTimeline();
  const { designData, updateDesignData } = useDesign();

  // State to track if the AI has confirmed all profile details are collected
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  // State for the initial message from the bot, shown when the component loads
  const [initialBotMessage, setInitialBotMessage] = useState("正在分析用户信息，请稍候...");

  // This function runs once when the component mounts to kick off the AI conversation
  const startProfileBuilding = useCallback(async () => {
    // Ensure we have the necessary data from previous steps
    if (designData.targetUser && designData.user) {
      const aiResult = await getAiResponse(
        [], // Initial conversation history is empty
        'buildUserProfile', // The specific task for the backend AI
        { 
          targetUser: designData.targetUser,
          user: designData.user 
        }
      );
      
      // Set the first message in the chat dialog
      setInitialBotMessage(aiResult.responseText);
      
      // The AI might extract some data in its first turn, so we update the state
      if (aiResult.extractedData && aiResult.extractedData.userProfile) {
        updateDesignData('userProfile', aiResult.extractedData.userProfile);
      }
      
      // If the task is somehow completed in one go, update the state
      if (aiResult.isTaskComplete) {
        setIsTaskComplete(true);
      }

    } else {
      // If data is missing, it's likely a direct navigation. Redirect to the previous page.
      console.warn("Missing targetUser or user data, redirecting to /page6.");
      navigate('/page6');
    }
  }, [designData.targetUser, designData.user, navigate, updateDesignData]);

  // useEffect to run the initial AI call
  useEffect(() => {
    setActiveStageId(2); // This page is part of Stage 2
    startProfileBuilding();
  }, [setActiveStageId, startProfileBuilding]);

  // Function to handle sending a user's message to the AI backend
  const handleSendMessage = async (userInput, currentMessages) => {
    const aiResult = await getAiResponse(
      // Pass the full conversation history, including the new user message
      [...currentMessages, { sender: 'user', text: userInput }],
      'buildUserProfile',
      { 
        targetUser: designData.targetUser,
        user: designData.user 
      }
    );
    return aiResult; // Return the full response object to the ChatDialog
  };

  // Callback for when the AI extracts new data
  const handleDataExtracted = (data) => {
    if (data && data.userProfile) {
      console.log("Extracted new user profile data:", data.userProfile);
      // Merge the newly extracted data into our global design state
      updateDesignData('userProfile', data.userProfile);
    }
  };

  // Callback for when the AI signals that the task is fully complete
  const handleTaskComplete = () => {
    console.log("AI has confirmed: user profile task is complete.");
    setIsTaskComplete(true);
  };

  // Function to navigate to the next page
  const handleNextPage = () => {
    completeStage(2); // Mark Stage 2 as fully completed
    navigate('/page8'); // Proceed to the next part of the design process
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.cardDisplay}>
          {/* The UserProfileCard dynamically displays data from the global state */}
          <UserProfileCard 
            profileData={designData.userProfile} 
            cardName={designData.user} 
          />
        </div>
        <button 
          className={styles.nextButton} 
          onClick={handleNextPage}
          disabled={!isTaskComplete} // The button is disabled until the AI task is complete
        >
          <NextButtonSVG />
        </button>
      </div>

      <div className={styles.rightPanel}>
        {/* The ChatDialog is the main interaction point for this page */}
        <ChatDialog
          // Using a key ensures the component re-mounts if the initial message changes
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