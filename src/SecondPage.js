// src/MainPage.js
import React from 'react';
import './SecondPage.css'; // 用于布局的 CSS 文件

// 导入您的组件
import BranchSelector from './BranchSelector';
import CardCarousel from './CardCarousel';
import ChatDialog from './ChatDialog';
import { ReactComponent as Background } from './assets/底面.png'; // 假设背景也是 SVG

function SecondPage() {
  return (
    <div className="second-container">
      <Background className="background" />
      <div className="content-container">
        <div className="left-panel">
          <BranchSelector />
        </div>
        <div className="center-panel">
          <CardCarousel />
        </div>
        <div className="right-panel">
          <ChatDialog />
        </div>
      </div>
    </div>
  );
}

export default SecondPage;