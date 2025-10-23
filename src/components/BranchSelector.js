// src/components/BranchSelector.js

import React, { useState } from 'react';
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
  { id: 1, MainNode: NodeWhite, subNodes: [] },
  { id: 2, MainNode: NodeRed, subNodes: [Node1_1, Node1_2, Node1_3] },
  { id: 3, MainNode: NodeGreen, subNodes: [Node2_1, Node2_2, Node2_3, Node2_4, Node2_5, Node2_6] },
  { id: 4, MainNode: NodePurple, subNodes: [Node3_1, Node3_2, Node3_3, Node3_4, Node3_5, Node3_6, Node3_7, Node3_8] },
  { id: 5, MainNode: NodeBlue, subNodes: [Node4_1, Node4_2, Node4_3] },
  { id: 6, MainNode: NodeGray, subNodes: [Node5_1, Node5_2, Node5_3, Node5_4] },
  { id: 7, MainNode: NodeWhite, subNodes: [] },
];


  // 您可以随时更改这个ID来查看不同阶段的激活状态
function BranchSelector({ activeStageId }) {
  // REMOVED: const [activeStageId, setActiveStageId] = useState(3);

  return (
    <div className="branch-selector-container">
      {treeData.map((stage, index) => {
        let status = 'locked';
        if (stage.id < activeStageId) status = 'completed';
        if (stage.id === activeStageId) status = 'active';

        // ... (the rest of your component's JSX remains exactly the same)
        const MainNode = stage.MainNode;

        return (
          <React.Fragment key={stage.id}>
            <div className={`stage-container ${status}`}>
              <div className="main-node">
                <MainNode />
              </div>
              <div className="sub-nodes-container">
                {stage.subNodes.map((SubNode, subIndex) => (
                  <div className="sub-node" key={subIndex}>
                    <SubNode />
                  </div>
                ))}
              </div>
            </div>

            {index < treeData.length - 1 && (
              <div className={`connector ${stage.id < activeStageId ? 'completed' : 'locked'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default BranchSelector;