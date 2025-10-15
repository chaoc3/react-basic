import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // 全局样式
import App from './App'; // 导入我们组装好的 App 组件

// 1. 找到 public/index.html 中的 <div id="root"></div>
const root = ReactDOM.createRoot(document.getElementById('root'));

// 2. 将我们的 App 组件渲染到那个 div 中
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);