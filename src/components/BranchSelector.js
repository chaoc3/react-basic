// src/components/BranchSelector.js

import React, { useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import './BranchSelector.css';

// 1. 【已修正】使用正确的默认导入方式导入所有 PNG 图片

import { ReactComponent as NodeWhite } from '../assets/网页素材/左侧时间轴素材/时间轴icon0-0.svg';
import { ReactComponent as NodeRed } from '../assets/网页素材/左侧时间轴素材/时间轴icon1-0.svg';
import { ReactComponent as NodeGreen } from '../assets/网页素材/左侧时间轴素材/时间轴icon2-0.svg';
import { ReactComponent as NodePurple } from '../assets/网页素材/左侧时间轴素材/时间轴icon3-0.svg';
import { ReactComponent as NodeBlue } from '../assets/网页素材/左侧时间轴素材/时间轴icon4-0.svg'; // 假设有蓝色icon
import { ReactComponent as NodeGray } from '../assets/网页素材/左侧时间轴素材/时间轴icon0-0.svg'; // 假设有灰色icon

// 子节点图标
import { ReactComponent as SubNodeCompleted } from '../assets/网页素材/左侧时间轴素材/时间轴icon1-0.svg'; // 用红色代表选中
import { ReactComponent as SubNodeDefault } from '../assets/网页素材/左侧时间轴素材/时间轴icon0-0.svg';
/* 
import { ReactComponent as NodeWhite } from '../assets/网页素材/左侧时间轴素材/时间轴icon0-0.svg';
import { ReactComponent as NodeRed } from '../assets/网页素材/左侧时间轴素材//时间轴icon1-0.svg';
import { ReactComponent as NodeGreen } from '..//assets/网页素材//左侧时间轴素材//时间轴icon2-0.svg';
import { ReactComponent as NodePurple } from '..//assets//网页素材//左侧时间轴素材//时间轴icon3-0.svg';
import { ReactComponent as NodeBlue } from '../assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as NodeGray } from '../assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node1_1 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node1_2 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node1_3 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node2_1 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node2_2 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node2_3 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node2_4 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node2_5 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node2_6 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node3_1 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node3_2 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node3_3 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node3_4 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node3_5 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node3_6 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node3_7 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node3_8 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node4_1 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node4_2 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node4_3 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node5_1 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node5_2 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node5_3 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';
import { ReactComponent as Node5_4 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg'; */
import timelineIcon11 from '../assets/时间轴图片/时间轴icon1-1.png';
import timelineIcon12 from '../assets/时间轴图片/时间轴icon1-2.png';
import timelineIcon13 from '../assets/时间轴图片/时间轴icon1-3.png';
import timelineIcon21 from '../assets/时间轴图片/时间轴icon2-1.png';
import timelineIcon22 from '../assets/时间轴图片/时间轴icon2-2.png';
import timelineIcon23 from '../assets/时间轴图片/时间轴icon2-3.png';
import timelineIcon24 from '../assets/时间轴图片/时间轴icon2-4.png';
import timelineIcon25 from '../assets/时间轴图片/时间轴icon2-5.png';
import timelineIcon26 from '../assets/时间轴图片/时间轴icon2-6.png';
import timelineIcon31 from '../assets/时间轴图片/时间轴icon3-1.png';
import timelineIcon32 from '../assets/时间轴图片/时间轴icon3-2.png';
import timelineIcon33 from '../assets/时间轴图片/时间轴icon3-3.png';
import timelineIcon34 from '../assets/时间轴图片/时间轴icon3-4.png';
import timelineIcon35 from '../assets/时间轴图片/时间轴icon3-5.png';
import timelineIcon36 from '../assets/时间轴图片/时间轴icon3-6.png';
import timelineIcon37 from '../assets/时间轴图片/时间轴icon3-7.png';
import timelineIcon38 from '../assets/时间轴图片/时间轴icon3-8.png';
import timelineIcon41 from '../assets/时间轴图片/时间轴icon4-1.png';
import timelineIcon42 from '../assets/时间轴图片/时间轴icon4-2.png';
import timelineIcon43 from '../assets/时间轴图片/时间轴icon4-3.png';
import timelineIcon51 from '../assets/时间轴图片/时间轴icon5-1.png';
import timelineIcon52 from '../assets/时间轴图片/时间轴icon5-2.png';
import timelineIcon53 from '../assets/时间轴图片/时间轴icon5-3.png';
import timelineIcon54 from '../assets/时间轴图片/时间轴icon5-4.png';


// 2. 定义树状结构的数据 (数据结构本身是正确的，无需修改)
const stageConfig = [
  { id: 1, MainNode: NodeWhite, subNodes: [] },
  {
    id: 2,
    MainNode: NodeRed,
    subNodes: [
      { id: 1, icon: timelineIcon11 },
      { id: 2, icon: timelineIcon12 },
      { id: 3, icon: timelineIcon13 },
    ],
  },
  {
    id: 3,
    MainNode: NodeGreen,
    subNodes: [
      { id: 1, icon: timelineIcon21 },
      { id: 2, icon: timelineIcon22 },
      { id: 3, icon: timelineIcon23 },
      { id: 4, icon: timelineIcon24 },
      { id: 5, icon: timelineIcon25 },
      { id: 6, icon: timelineIcon26 },
    ],
  },
  {
    id: 4,
    MainNode: NodePurple,
    subNodes: [
      { id: 1, icon: timelineIcon31 },
      { id: 2, icon: timelineIcon32 },
      { id: 3, icon: timelineIcon33 },
      { id: 4, icon: timelineIcon34 },
      { id: 5, icon: timelineIcon35 },
      { id: 6, icon: timelineIcon36 },
      { id: 7, icon: timelineIcon37 },
      { id: 8, icon: timelineIcon38 },
    ],
  },
  {
    id: 5,
    MainNode: NodeBlue,
    subNodes: [
      { id: 1, icon: timelineIcon41 },
      { id: 2, icon: timelineIcon42 },
      { id: 3, icon: timelineIcon43 },
    ],
  },
  {
    id: 6,
    MainNode: NodeGray,
    subNodes: [
      { id: 1, icon: timelineIcon51 },
      { id: 2, icon: timelineIcon52 },
      { id: 3, icon: timelineIcon53 },
      { id: 4, icon: timelineIcon54 },
    ],
  },
  { id: 7, MainNode: NodeWhite, subNodes: [] },
];

function BranchSelector({ onTimelineClick }) {
  const { openSummary,activeStageId, completedStages, selectedCards } = useTimeline();

  return (
    <div className="branch-selector-container" onClick={openSummary}>
      {stageConfig.map((stage, index) => {
        const isCompleted = completedStages.has(stage.id);
        const isActive = stage.id === activeStageId;
        const isLocked = !isActive && !isCompleted;

        let status = 'locked';
        if (isCompleted) status = 'completed';
        if (isActive) status = 'active';
        
        const MainNodeIcon = isLocked ? NodeGray : stage.MainNode;
        const selectedSubNodes = selectedCards[stage.id] || new Set();

        return (
          <React.Fragment key={stage.id}>
            <div className={`stage-container ${status}`}>
              {/* Main Node remains the same */}
              <div className="main-node">
                <MainNodeIcon />
              </div>

              {/* Sub-nodes are now grouped horizontally */}
              {stage.subNodes.length > 0 && (
                <div className="sub-nodes-container">
                  {stage.subNodes.map(({ id: cardId, icon }) => {
                    const isSelected = selectedSubNodes.has(cardId);
                    
                    return (
                      <div className={`sub-node ${isSelected ? 'completed' : ''}`} key={cardId}>
                        <img src={icon} alt={`stage-${stage.id}-sub-${cardId}`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Connector logic remains the same */}
            {index < stageConfig.length - 1 && (
              <div className={`connector ${isCompleted ? 'completed' : 'locked'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default BranchSelector;