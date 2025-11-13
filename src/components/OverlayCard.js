// src/components/OverlayCard.js

import React from 'react';
import styles from './OverlayCard.module.css'; 

/**
 * 通用叠加信息卡片组件
 * @param {object} props
 * @param {string} props.backgroundImageUrl - 卡片背景图片的 URL
 * @param {Array<object>} props.fields - 要叠加的字段数组
 * @param {string} props.fields[].label - 字段的标签 (例如: "年龄")
 * @param {string} props.fields[].value - 字段的值 (例如: profileData.age)
 * @param {string} props.fields[].placeholder - 字段为空时的占位符
 */
const OverlayCard = ({ backgroundImageUrl, fields }) => {
  
  // 辅助函数，用于显示数据或占位符
  const renderField = (value, placeholder) => {
    // 检查值是否为 null, undefined, 或空字符串
    return value && value.trim() !== '' ? 
           <span>{value}</span> : 
           <span className={styles.placeholder}>{placeholder}</span>;
  };

  return (
    <div className={styles.cardContainer}>
      {/* 背景图片 */}
      <div className={styles.backgroundCard}>
        <img src={backgroundImageUrl} alt="Card Background" className={styles.cardImage} />
      </div>
      
      {/* 浮动的信息层 */}
      <div className={styles.overlayInfo}>
        {fields.map((field, index) => (
          <div key={index} className={styles.field}>
            <strong>{field.label}:</strong> {renderField(field.value, field.placeholder)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverlayCard;