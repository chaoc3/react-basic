import React from 'react';
import styles from './styles/Page16_Sum.module.css';
import background from '../assets/页面剩余素材/Page6-展开页面.svg'; // 确认这是正确的背景图片路径
import closeIcon from '../assets/页面剩余素材/Page16按钮.svg'; // 确认这是关闭按钮图标的路径
import { useDesign } from '../context/DesignContext'; // <-- 1. Import the hook

const Page16_Sum = ({ isOpen, onClose, entryPoint }) => {
    const { designData } = useDesign(); // <-- 2. Get the collected data
  
    if (!isOpen) {
      return null;
    }
    
    // Helper to display data or a placeholder
    const renderData = (data, placeholder = '尚未确定') => {
      if (!data) return <span className={styles.placeholder}>{placeholder}</span>;
      // You might need more complex logic based on data structure
      if (typeof data === 'object') return JSON.stringify(data);
      return data;
    };
  
    const handleClose = () => {
      onClose(entryPoint);
    };
  
    return (
      <div className={styles.overlay}>
        <div className={styles.content} style={{ backgroundImage: `url(${background})` }}>
          <button onClick={handleClose} className={styles.closeButton}>
            <img src={closeIcon} alt="Close" />
          </button>
          
          <div className={styles.scrollableContent}>
            {/* 3. Display data from the context */}
            <h2>设计目标</h2>
            <h3>User Type (from AI)</h3>
            <p>{renderData(designData.targetUser?.TargetUser)}</p>
  
            <h3>Painpoint</h3>
            <p>{renderData(designData.targetPainpoint?.TargetPainpoint)}</p>
            
            <h3>Stage</h3>
            <p>{renderData(designData.targetStage?.TargetStage)}</p>
  
            <hr />
  
            <h2>User Details</h2>
            <h3>Selected User Group</h3>
            <p>{renderData(designData.userCard?.name)}</p>
            
            <h3>User Profile</h3>
            {/* Example of displaying object data */}
            {designData.userDetails ? (
              <ul>
                <li>Age: {renderData(designData.userDetails.age)}</li>
                <li>Gender: {renderData(designData.userDetails.gender)}</li>
                <li>Education: {renderData(designData.userDetails.education)}</li>
              </ul>
            ) : (
              <p className={styles.placeholder}>尚未确定</p>
            )}
  
            {/* ... Add sections for all other data points ... */}
          </div>
        </div>
      </div>
    );
  };
  
  export default Page16_Sum;