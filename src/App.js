import React from 'react';
import './App.css';
import CardCarousel from './components/CardCarousel'; // 1. 导入我们新建的轮播组件
import ChatDialog from './components/ChatDialog';
import BranchSelector from './components/BranchSelector';



function App() {
  return (
    <div className="app-container">
      {/* 
        这里可以放置顶部的提示信息框，
        我们暂时用一个简单的 div 代替 
      */}
      
      <div className="left-panel">
        <BranchSelector />
      </div>
      <div className="center-column">
        <CardCarousel />
        
      </div>
      {/* 右侧区域 */}
      <div className="right-panel">
        {/* 2. 在这里使用 ChatDialog 组件 */}
        <ChatDialog />
      </div>
      {/* 2. 在这里使用我们的轮播组件 */}
      
    </div>
  );
}
export default App;