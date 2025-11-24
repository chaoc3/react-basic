// src/assets/cardAssets.js

// 导入所有阶段会用到的卡片 PNG 图片

// --- Stage 2: User Cards ---
import CardUser1 from '../assets/卡片背面/User-1-2.png';
import CardUser2 from '../assets/卡片背面/User-2-2.png';
import CardUser3 from '../assets/卡片背面/User-3-2.png';

// --- Stage 3: Scenario Cards ---
import CardScenario1 from '../assets/卡片背面/Scenario-1-2.png';
import CardScenario2 from '../assets/卡片背面/Scenario-2-2.png';
import CardScenario3 from '../assets/卡片背面/Scenario-3-2.png';
import CardScenario4 from '../assets/卡片背面/Scenario-4-2.png';
import CardScenario5 from '../assets/卡片背面/Scenario-5-2.png';
import CardScenario6 from '../assets/卡片背面/Scenario-6-2.png';

// --- Stage 4: Mechanism Cards ---
import CardMec1 from '../assets/卡片背面/Mec-1-2.png';
import CardMec2 from '../assets/卡片背面/Mec-2-2.png';
import CardMec3 from '../assets/卡片背面/Mec-3-2.png';
import CardMec4 from '../assets/卡片背面/Mec-4-2.png';
import CardMec5 from '../assets/卡片背面/Mec-5-2.png';
import CardMec6 from '../assets/卡片背面/Mec-6-2.png';
import CardMec7 from '../assets/卡片背面/Mec-7-2.png';
import CardMec8 from '../assets/卡片背面/Mec-8-2.png';

// --- Stage 5: Info Source Cards ---
// 临时使用 SVG（等待 PNG 文件）
import CardInfS1 from '../assets/卡片背面/InfS-1-2.png';
import CardInfS2 from '../assets/卡片背面/InfS-2-2.png';
import CardInfS3 from '../assets/卡片背面/InfS-3-2.png';

// --- Stage 6: Mode Cards ---
import CardMod1 from '../assets/卡片背面/Mod-1-2.png';
import CardMod2 from '../assets/卡片背面/Mod-2-2.png';
import CardMod3 from '../assets/卡片背面/Mod-3-2.png';
import CardMod4 from '../assets/卡片背面/Mod-4-2.png';


// 将所有卡片按 Stage ID 和 Card ID 组织起来并导出
export const cardAssets = {
  // Stage ID 2 对应 "User"
  2: {
    1: CardUser1,
    2: CardUser2,
    3: CardUser3,
  },
  // Stage ID 3 对应 "Scenario"
  3: {
    1: CardScenario1,
    2: CardScenario2,
    3: CardScenario3,
    4: CardScenario4,
    5: CardScenario5,
    6: CardScenario6,
  },
  // Stage ID 4 对应 "Mechanism"
  4: {
    1: CardMec1,
    2: CardMec2,
    3: CardMec3,
    4: CardMec4,
    5: CardMec5,
    6: CardMec6,
    7: CardMec7,
    8: CardMec8,
  },
  // Stage ID 5 对应 "Info Source"
  5: {
    1: CardInfS1,
    2: CardInfS2,
    3: CardInfS3,
  },
  // Stage ID 6 对应 "Mode"
  6: {
    1: CardMod1,
    2: CardMod2,
    3: CardMod3,
    4: CardMod4,
  },
};