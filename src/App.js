import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page1Intro from './pages/Page1_Intro';
import Page2Intro from './pages/Page2_Intro';
import Page3_TargetUser from './pages/Page3_Target-User';
import Page4_TargetPainpoint from './pages/Page4_Target-Painpoint';
import Page5_TargetStage from './pages/Page5_Target-Stage';
import Page6_User_1 from './pages/Page6_User_1';
import Page7_User_2 from './pages/Page7_User_2';
import Page8_Scenario_1 from './pages/Page10_1';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Page8_Scenario_1  />} />
          <Route path="/page6" element={<Page6_User_1 />} />
          
          <Route path="/intro-2" element={<Page2Intro />} />
          
          <Route path="/target-user" element={<Page3_TargetUser />} />
          <Route path="/target-painpoint" element={<Page4_TargetPainpoint />} />

          
          <Route path="/target-stage" element={<Page5_TargetStage />} />
          <Route path="/page7" element={<Page7_User_2 />} /> {/* 必须有这一行 */}
          <Route path="/page8" element = {<Page8_Scenario_1/>}/>
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;