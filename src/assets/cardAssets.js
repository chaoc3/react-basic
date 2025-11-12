// src/assets/cardAssets.js

// 导入所有阶段会用到的卡片 SVG 组件

// --- Stage 2: User Cards ---
import { ReactComponent as CardUser1 } from './卡片 - svg/卡片正面-选择页/User-1-1.svg';
import { ReactComponent as CardUser2 } from './卡片 - svg/卡片正面-选择页/User-2-1.svg';
import { ReactComponent as CardUser3 } from './卡片 - svg/卡片正面-选择页/User-3-1.svg';

// --- Stage 3: Scenario Cards ---
import { ReactComponent as CardScenario1 } from './卡片 - svg/卡片正面-选择页/Scenario-1-1.svg';
import { ReactComponent as CardScenario2 } from './卡片 - svg/卡片正面-选择页/Scenario-2-1.svg';
// ... 导入所有 Scenario 卡片

// --- Stage 4: Mechanism Cards ---
import { ReactComponent as CardMec1 } from './卡片 - svg/卡片正面-选择页/Mec-1-1.svg';
import { ReactComponent as CardMec2 } from './卡片 - svg/卡片正面-选择页/Mec-2-1.svg';
// ... 导入所有 Mechanism 卡片

// --- Stage 5: Info Source Cards ---
// ... 导入 Info Source 卡片

// --- Stage 6: Mode Cards ---
// ... 导入 Mode 卡片


// 将所有卡片按 Stage ID 和 Card ID 组织起来并导出
export const cardAssets = {
  // Stage ID 2 对应 "User"
  2: {
    1: <CardUser1 />,
    2: <CardUser2 />,
    3: <CardUser3 />,
  },
  // Stage ID 3 对应 "Scenario"
  3: {
    1: <CardScenario1 />,
    2: <CardScenario2 />,
    // ...
  },
  // Stage ID 4 对应 "Mechanism"
  4: {
    1: <CardMec1 />,
    2: <CardMec2 />,
    // ...
  },
  // Stage ID 5 对应 "Info Source"
  5: {
    // ...
  },
  // Stage ID 6 对应 "Mode"
  6: {
    // ...
  },
};