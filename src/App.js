import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page1Intro from './pages/Page1_Intro';
import Page2Intro from './pages/Page2_Intro';
import Page3_TargetUser from './pages/Page3_Target-User';
import Page4_TargetPainpoint from './pages/Page4_Target-Painpoint';
import Page5_TargetStage from './pages/Page5_Target-Stage';
import Page6_User_1 from './pages/Page6_User_1';
import Page7_User_2 from './pages/Page7_User_2';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 默认路径'/'渲染 Page1 */}
          <Route path="/" element={<Page1Intro  />} />
          <Route path="/page6" element={<Page6_User_1 />} />
          {/* '/intro-2' 路径渲染 Page2 */}
          <Route path="/intro-2" element={<Page2Intro />} />
          
          <Route path="/target-user" element={<Page3_TargetUser />} />

          {/* 【新增】页面 4: 确定痛点 */}
          <Route path="/target-painpoint" element={<Page4_TargetPainpoint />} />

          {/* 【新增】页面 5: 确定阶段 */}
          <Route path="/target-stage" element={<Page5_TargetStage />} />
          <Route path="/page7" element={<Page7_User_2 />} /> {/* 必须有这一行 */}
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;