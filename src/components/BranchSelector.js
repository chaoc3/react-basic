// src/components/BranchSelector.js

import React, { useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import './BranchSelector.css';

// 1. 【已修正】使用正确的默认导入方式导入所有 PNG 图片



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
import { ReactComponent as Node5_4 } from '..//assets//网页素材//左侧时间轴素材//时间轴icon0-0.svg';


// 2. 定义树状结构的数据 (数据结构本身是正确的，无需修改)
const treeData = [
  // This data now only needs the main node icon and the number of sub-nodes
  { id: 1, MainNode: NodeWhite, subNodeCount: 0 },
  { id: 2, MainNode: NodeRed, subNodeCount: 3 }, // Corresponds to Page6
  { id: 3, MainNode: NodeGreen, subNodeCount: 6 }, // Corresponds to Page8
  { id: 4, MainNode: NodePurple, subNodeCount: 8 }, // Corresponds to Page10/12
  { id: 5, MainNode: NodeBlue, subNodeCount: 3 },
  { id: 6, MainNode: NodeGray, subNodeCount: 4 },
  { id: 7, MainNode: NodeWhite, subNodeCount: 0 },
];
const subNodeIcons = {
  completed: NodeRed, // Example: use a colored dot for completed
  default: NodeWhite, // Default gray/white dot
};


  // 您可以随时更改这个ID来查看不同阶段的激活状态
  function BranchSelector({ onTimelineClick }) {
    

    // Get all state and functions from the global context
    const { activeStageId, completedStages, selectedCards } = useTimeline();
  
    return (
      <div className="branch-selector-container" onClick={onTimelineClick}>
        {treeData.map((stage, index) => {
          let status = 'locked';
          if (completedStages.has(stage.id)) status = 'completed';
          if (stage.id === activeStageId) status = 'active';
  
          const MainNode = stage.MainNode;
          const selectedSubNodes = selectedCards[stage.id] || new Set();
  
          return (
            <React.Fragment key={stage.id}>
              <div className={`stage-container ${status}`}>
                <div className="main-node">
                  <MainNode />
                </div>
                <div className="sub-nodes-container">
                  {/* Create sub-nodes based on count */}
                  {Array.from({ length: stage.subNodeCount }).map((_, subIndex) => {
                    // Check if this sub-node is "selected"
                    // NOTE: This assumes card IDs are 1-based (1, 2, 3...)
                    const isSelected = selectedSubNodes.has(subIndex + 1);
                    const SubNodeIcon = isSelected ? subNodeIcons.completed : subNodeIcons.default;
                    
                    return (
                      <div className={`sub-node ${isSelected ? 'completed' : ''}`} key={subIndex}>
                        <SubNodeIcon />
                      </div>
                    );
                  })}
                </div>
              </div>
  
              {index < treeData.length - 1 && (
                <div className={`connector ${completedStages.has(stage.id) || stage.id < activeStageId ? 'completed' : 'locked'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
  
  export default BranchSelector;