import React from 'react';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page7_User_2.module.css';
import backgroundForPage from '../assets/页面剩余素材/Page68101112131415页面.svg'; 

// 假设这是从上一页选择的用户卡片
import { ReactComponent as SelectedUserCard } from '../assets/卡片 - svg/卡片反面-细化页/User-1-2.svg';
// 假设这是用户头像的 SVG
import { ReactComponent as UserAvatar } from '../assets/网页素材/左侧时间轴素材/时间轴icon0-0.svg';

const Page7_User_2 = () => {
  return (
    <div className={styles.container}
    style={{ backgroundImage: `url(${backgroundForPage})` }}>
      <div className={styles.leftPanel}>
          <div className={styles.userAvatarContainer}>
              <div className={styles.avatarOverlay}></div>
              <UserAvatar className={styles.avatar} />
          </div>
          <BranchSelector />
      </div>
      <div className={styles.mainContent}>
        {/* 这里直接显示上一页选中的卡片SVG */}
        <SelectedUserCard />
        <button className={styles.nextButton}>Next</button>
      </div>
      <div className={styles.rightPanel}>
        <ChatDialog />
      </div>
    </div>
  );
};

export default Page7_User_2;