import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page1Intro from './pages/Page1_Intro';
import Page2Intro from './pages/Page2_Intro';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 默认路径'/'渲染 Page1 */}
          <Route path="/" element={<Page1Intro />} />
          
          {/* '/intro-2' 路径渲染 Page2 */}
          <Route path="/intro-2" element={<Page2Intro />} />
          
          {/* 在这里继续为 Page3 及之后的页面添加路由 */}
          {/* <Route path="/target-user" element={<TargetUserPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;