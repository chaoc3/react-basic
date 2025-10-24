import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page1_Intro.module.css';

// 导入您的SVG文件
// 请将下面的路径替换为您项目中实际的SVG文件路径
import pageBackground from '../assets/页面剩余素材/Page1-Intro.svg'; 
// 如果按钮是独立的SVG，请取消下面这行的注释
import nextButton from '../assets/页面剩余素材/Page1-2 按钮.svg';

function Page1Intro() {
  const navigate = useNavigate();

  const handleNextPage = () => {
    // 点击后跳转到 '/intro-2' 路由
    navigate('/intro-2');
  };

  return (
    <div className={styles.pageContainer}>
      {/* 背景SVG */}
      <img src={pageBackground} alt="Introduction Page 1" className={styles.backgroundImage} />
      
      {/* 
        可点击的 "Next" 按钮区域。
        这是一个覆盖在SVG按钮上的透明div，用于触发点击事件。
        您需要通过CSS调整它的位置和大小，使其精确匹配您SVG中的按钮。
        <div 
        
        className={styles.nextButton} 
        onClick={handleNextPage}
        title="Go to next page"
      ></div>
      */}
      <img 
        src={nextButton} 
        alt="Next Button"
        className={styles.nextButton}
        onClick={handleNextPage}
      />
    
      {/* --- 如果您的按钮是独立的SVG文件，请使用下面的代码替换上面的div ---
      <img 
        src={nextButton} 
        alt="Next Button"
        className={styles.nextButton}
        onClick={handleNextPage}
      />
      */}
    </div>
  );
}

export default Page1Intro;