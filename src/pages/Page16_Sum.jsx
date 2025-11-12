import React from 'react';
import styles from './styles/Page16_Sum.module.css';
import background from '../assets/页面剩余素材/Page6-展开页面.svg'; // 确认这是正确的背景图片路径
import closeIcon from '../assets/页面剩余素材/Page16按钮.svg'; // 确认这是关闭按钮图标的路径
import { useDesign } from '../context/DesignContext'; // <-- 1. Import the hook

const Page16_Sum = ({ isOpen, onClose, entryPoint }) => {
  // Hooks规则保持正确：在组件顶层调用
  const { designData } = useDesign();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const renderData = (data, placeholder = '尚未确定') => {
    if (data === null || typeof data === 'undefined' || data === '') {
      return <span className={styles.placeholder}>{placeholder}</span>;
    }
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return data;
  };

  const handleClose = () => {
    onClose(entryPoint);
  };

  return (
    <div className={styles.overlay}>
      <button onClick={handleClose} className={styles.closeButton}>
        <img src={closeIcon} alt="Close" />
      </button>

      {/* 
        核心改动: .content 现在是一个相对定位的容器。
        它不再有 background-image 样式。
      */}
      <div className={styles.content}>
        {/* 1. 使用真实的 <img> 标签来显示背景并撑开高度 */}
        <img src={background} alt="Design Summary Background" className={styles.backgroundImage} />

        {/* 2. 创建一个新的 div 用于绝对定位，浮动在图片之上 */}
        <div className={styles.textOverlay}>

          {/* 3. 将之前的所有 .section 内容块都放入这个浮动层中 */}
          <div className={styles.section} id="design-target">
            <h2>设计目标</h2>
            <div className={styles.infoGrid}>
              <div>
                <h4>用户群体</h4>
                <p>{renderData(designData.targetUser?.TargetUser)}</p>
              </div>
              <div>
                <h4>设计痛点</h4>
                <p>{renderData(designData.targetPainpoint?.TargetPainpoint)}</p>
              </div>
              <div>
                <h4>行为阶段</h4>
                <p>{renderData(designData.targetStage?.TargetStage)}</p>
              </div>
            </div>
          </div>

          <div className={styles.section} id="user-details">
            <h2>用户画像</h2>
            <h4>选择的用户卡片: {renderData(designData.userCard?.name)}</h4>
            {designData.userDetails ? (
              <ul>
                <li>年龄: {renderData(designData.userDetails.UserAge)}</li>
                <li>性别: {renderData(designData.userDetails.UserSexual)}</li>
                <li>教育背景: {renderData(designData.userDetails.UserEdu)}</li>
                <li>职业类型: {renderData(designData.userDetails.UserWork)}</li>
                <li>设备熟练度: {renderData(designData.userDetails.UserEquip)}</li>
              </ul>
            ) : (
              <p className={styles.placeholder}>用户详细信息尚未确定</p>
            )}
          </div>
          
          {/* 这里可以继续添加 Scenario, Mechanism 等其他部分 */}

        </div>
      </div>
    </div>
  );
};

export default Page16_Sum;