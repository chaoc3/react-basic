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