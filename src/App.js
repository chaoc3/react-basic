import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { DesignProvider } from './context/DesignContext';

import Page1Intro from './pages/Page1_Intro';
import Page2Intro from './pages/Page2_Intro';
import Page3_TargetUser from './pages/Page3_Target-User';
import Page4_TargetPainpoint from './pages/Page4_Target-Painpoint';
import Page5_TargetStage from './pages/Page5_Target-Stage';
import Page6_User_1 from './pages/Page6_User_1';
import Page7_User_2 from './pages/Page7_User_2';
import Page8_1 from './pages/Page8_1';
import Page9_Scenario_2 from './pages/Page9_2'
import Page10_1 from './pages/Page10_1';
import Page11_2 from './pages/Page11_2';
import Page12_1 from './pages/Page12_1';
import Page13_2 from './pages/Page13_2';
import Page14_User_1 from './pages/Page14_1';
import Page15_2 from './pages/Page15_2';
import Page16_Sum from './pages/Page16_Sum';


function App() {
  return (
    
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Page3_TargetUser />} />
          
          <Route path="/intro-2" element={<Page2Intro />} />
          <Route path="/target-user" element={<Page3_TargetUser />} />
          <Route path="/target-painpoint" element={<Page4_TargetPainpoint />} />
          <Route path="/target-stage" element={<Page5_TargetStage />} />
          <Route path="/page6" element={<Page6_User_1 />} />
          <Route path="/page7" element={<Page7_User_2 />} /> 
          <Route path='/page8' element = {<Page8_1/>}/>
          <Route path='/page9' element = {<Page9_Scenario_2/>}/>
          <Route path="/page10" element = {<Page10_1/>}/>
          <Route path='/page11' element = {<Page11_2/>}/>
          <Route path="/page12" element={<Page12_1 />} />
          <Route path="/page13" element={<Page13_2 />} />
          <Route path="/page14" element={<Page14_User_1 />} />
          <Route path="/page15" element={<Page15_2 />} />
          <Route path="/summary" element={<Page16_Sum />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;