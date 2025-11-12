import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTimeline } from '../context/TimelineContext'; // Import the global state hook

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';

// SVG Asset Imports
import { ReactComponent as CardUser1 } from '../assets/卡片 - svg/卡片正面-选择页/User-1-1.svg';
import { ReactComponent as CardUser2 } from '../assets/卡片 - svg/卡片正面-选择页/User-2-1.svg';
import { ReactComponent as CardUser3 } from '../assets/卡片 - svg/卡片正面-选择页/User-3-1.svg';
import { ReactComponent as NextButtonSVG } from '../assets/页面剩余素材/Next按钮.svg';

// CSS Module Import
import styles from './styles/Page7_User_2.module.css';

// Card data definition (must be consistent with Page 6)
const cards = [
  { id: 1, component: <CardUser1 />, name: '慢病患者' },
  { id: 2, component: <CardUser2 />, name: '健康风险人群' },
  { id: 3, component: <CardUser3 />, name: '心理健康群体' },
];

const Page7_User_2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get state management functions from the global TimelineContext
  const { setActiveStageId } = useTimeline();

  // Get the selected card ID passed from the previous page
  const selectedId = location.state?.selectedId;

  // Find the full card object based on the ID
  const selectedCard = cards.find(card => card.id === selectedId);

  // On component mount, manage timeline state and handle invalid access
  useEffect(() => {
    // This page is a continuation of Stage 2, so keep it active
    setActiveStageId(2);

    // If a user navigates here directly without a selection, redirect them back
    if (!selectedCard) {
      console.warn("No selected card found. Redirecting to selection page.");
      navigate('/page6');
    }
  }, [selectedCard, navigate, setActiveStageId]);

  // Handles navigation to the next major step in the process
  const handleNextPage = () => {
    console.log("Navigating to the next page (e.g., Page 8)");
    navigate('/page8'); // Navigate to the scenario selection page
  };

  // Dummy functions for the ChatDialog component
  const dummyOnSendMessage = async (input) => {
    console.log(`User input (UI mode): ${input}`);
    return { responseText: "This is a static reply." };
  };
  const dummyOnDataExtracted = (data) => {
    console.log("Data extraction (UI mode). Received:", data);
  };

  // Render nothing while the redirect is happening to prevent errors
  if (!selectedCard) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        {/* BranchSelector will correctly display the state for Stage 2 */}
        <BranchSelector />
      </div>

      <div className={styles.mainContent}>
        {/* Display only the selected card */}
        <div className={styles.cardDisplay}>
          <div className={styles.card}>
            {selectedCard.component}
          </div>
        </div>
        <button className={styles.nextButton} onClick={handleNextPage}>
          <NextButtonSVG />
        </button>
      </div>

      <div className={styles.rightPanel}>
        <ChatDialog
          initialBotMessage="太好了，我们已经确定了你的设计对象。接下来，我想更了解你的设计出发点。"
          onSendMessage={dummyOnSendMessage}
          onDataExtracted={dummyOnDataExtracted}
        />
      </div>
    </div>
  );
};

export default Page7_User_2;