import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Page2_Intro.module.css';
import nextButton from '../assets/页面剩余素材/Page1-2 按钮.svg';
// 请将下面的路径替换为您项目中实际的SVG文件路径
import pageBackground from '../assets/页面剩余素材/Page2-Intro.svg';

function Page2Intro() {
  const navigate = useNavigate();

  const handleNextPage = () => {
    // 点击后跳转到下一个页面 (Page3)
    // 路径 '/target-user' 需要在 App.jsx 中配置
    navigate('/target-user'); 
  };

  return (
    <div className={styles.pageContainer}>
      <img src={pageBackground} alt="Introduction Page 2" className={styles.backgroundImage} />
      
      <img 
        src={nextButton} 
        alt="Next Button"
        className={styles.nextButton}
        onClick={handleNextPage}
      />
    </div>
  );
}

export default Page2Intro;