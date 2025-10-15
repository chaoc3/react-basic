import React from 'react';
import './App.css';
import CardCarousel from './components/CardCarousel'; // 1. 导入我们新建的轮播组件
import ChatDialog from './components/ChatDialog';

function App() {
  return (
    <div className="app-container">
      {/* 
        这里可以放置顶部的提示信息框，
        我们暂时用一个简单的 div 代替 
      */}
      <div className="info-box">
        <p>让我们一起确定你的设计对象吧！</p>
        <p>我会根据你的想法与描述，帮你筛选出最贴近的用户类型。你也可以自由浏览卡片，慢慢找到最合适的那一类。点击卡片确认后，点击下方按钮继续我们的设计旅程。</p>
      </div>
      

      {/* 右侧区域 */}
      <div className="right-panel">
        {/* 2. 在这里使用 ChatDialog 组件 */}
        <ChatDialog />
      </div>
      {/* 2. 在这里使用我们的轮播组件 */}
      <CardCarousel />
    </div>
  );
}
export default App;