// src/components/UserProfileCard.js

import React from 'react';
import styles from './UserProfileCard.module.css'; // 我们会创建这个 CSS 文件
import { ReactComponent as CardUser1 } from '../assets/卡片 - svg/卡片正面-选择页/User-1-1.svg'; // 举例

// 这是一个简单的映射，实际项目中可以更复杂
const cardComponents = {
  '慢病患者': <CardUser1 />,
  // ... 其他卡片
};

const UserProfileCard = ({ profileData, cardName }) => {
  const CardComponent = cardComponents[cardName] || <div />;

  // 辅助函数，用于显示数据或占位符
  const renderField = (value, placeholder) => {
    return value ? <span>{value}</span> : <span className={styles.placeholder}>{placeholder}</span>;
  };

  return (
    <div className={styles.cardContainer}>
      {/* 背景卡片 */}
      <div className={styles.backgroundCard}>
        {CardComponent}
      </div>
      
      {/* 浮动的信息层 */}
      <div className={styles.overlayInfo}>
        <div className={styles.field}><strong>年龄:</strong> {renderField(profileData.age, '待补充...')}</div>
        <div className={styles.field}><strong>性别:</strong> {renderField(profileData.sexual, '待补充...')}</div>
        <div className={styles.field}><strong>教育:</strong> {renderField(profileData.edu, '待补充...')}</div>
        <div className={styles.field}><strong>职业:</strong> {renderField(profileData.work, '待补充...')}</div>
        <div className={styles.field}><strong>设备熟练度:</strong> {renderField(profileData.equip, '待补充...')}</div>
      </div>
    </div>
  );
};

export default UserProfileCard;