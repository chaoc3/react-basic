import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { TimelineProvider, useTimeline } from './context/TimelineContext';
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
import Page17_Achieve from './pages/Page17_Achieve';

function AppContent() {
  // 1. 从全局 Context 获取总结页面的状态和关闭函数
  const { isSummaryOpen, closeSummary } = useTimeline();
  const navigate = useNavigate(); // 如果需要关闭后跳转

  const handleCloseSum = () => {
    closeSummary();
    // 您可以根据需求决定关闭后是否需要跳转
    // 例如，如果需要实现需求文档中的“从Page15关闭后跳转”
    // const currentLocation = window.location.pathname;
    // if (currentLocation.includes('page15')) {
    //   navigate('/achieve');
    // }
  };
  return (
    <>
      {/* 2. 路由部分，负责渲染背景里的主页面 */}
      <Routes>
              <Route path="/" element={<Page1Intro />} />
              
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
              <Route path="/achieve" element={<Page17_Achieve />} />
            </Routes>

      {/* 3. 在这里渲染总结页面，它的显示由全局状态 isSummaryOpen 控制 */}
      <Page16_Sum 
        isOpen={isSummaryOpen} 
        onClose={handleCloseSum}
      />
    </>
  );

}

function App() {
  return (
    <TimelineProvider>
      <DesignProvider>
        <Router>
          <AppContent />
        </Router>
      </DesignProvider>


    </TimelineProvider>
      
      
  );
}

export default App;