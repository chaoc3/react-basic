// src/pages/Page17_Achieve.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
// 直接使用 Page7 的样式，因为布局和背景完全一致
import styles from './styles/Page17_Achieve.module.css'; 

const Page17_Achieve = () => {
  const navigate = useNavigate();

  // 为中间和右侧的对话框定义不同的模拟函数
  const mainChatSendMessage = async (input) => {
    console.log("Main chat input:", input);
    return { responseText: "这是主对话框的回复。您可以在这里进行最终的编辑和确认。" };
  };

  const sideChatSendMessage = async (input) => {
    console.log("Side chat input:", input);
    return { responseText: "这是辅助对话框的回复。" };
  };

  const handleDataExtracted = (data) => {
    console.log("Data extracted:", data);
  };

  // 此页面不再需要“下一步”按钮，但可以保留一个函数用于未来的导航
  const handleFinalize = () => {
    console.log("Design finalized.");
    // navigate('/final-summary'); // 例如，导航到最终总结页
  };

  return (
    <div className={styles.container}>
      {/* 左侧面板：时间轴，与 Page7 结构相同 */}
      <div className={styles.leftPanel}>
        {/* activeStageId 应更新为最终阶段的 ID */}
        <BranchSelector activeStageId={9} /> 
      </div>

      {/* 中间主要内容：卡片被替换为 ChatDialog 组件 */}
      <div className={styles.mainContent}>
        <ChatDialog
          initialBotMessage={`你的助推设计方案已准备好！
我已根据你前面的所有选择，生成了一份完整的助推设计方案。你可以直接查看，也可以继续补充、修改，让它更贴近你的构想。设计从不止步，我们可以一起让它变得更好。
1. 设计目标
设计方向: 本方案旨在通过智能代理，为需要进行体重管理的年轻上班族提供个性化的行为助推，帮助他们建立并维持健康的饮食和运动习惯。
核心痛点: 解决因工作繁忙和疲劳导致的饮食不规律及缺乏运动动力的问题。
切入阶段: 行为促进阶段，重点在于推动用户将健康意图转化为实际行动。
2. 用户与场景
目标用户:
用户画像: 28岁，从事市场营销工作的男性上班族，对智能设备使用非常熟练。
核心特征: 有体重管理的意愿，但缺乏具体、可持续的行动策略和外部激励。
核心场景:
场景描述: 主要覆盖用户独自一人时的工作场景（如决定晚餐）和居家场景（如周末的闲暇时间）。
关键时刻: 在用户最可能做出不健康选择的节点（如下班后、点外卖前）进行干预。
3. 助推策略
核心机制:
提醒与建议: 在晚餐前推送低卡路里食谱或健康外卖选项，并在周末下午建议简单的居家锻炼活动。
决策简化: 提供一键生成购物清单并跳转至购物应用的功能，减少健康饮食的准备阻力。
信息依据:
自我数据驱动: 通过追踪用户的体重和步数数据，以图表形式展示其努力成果，增强自我效能感。
专家内容支持: 所有食谱和健康建议均由专业营养师提供，确保信息的权威性和有效性。
交互方式:
主要模态: 以文本交互为主，通过移动应用向用户推送个性化的通知和消息。
呈现方式: 采用积极、鼓励的语气，结合简洁明了的数据图表，让用户直观地感受到自己的进步。`}
          onSendMessage={mainChatSendMessage}
          onDataExtracted={handleDataExtracted}
          isInputEnabled={true}
        />
        {/* 这里不再需要 Next 按钮 */}
      </div>

      {/* 右侧面板：保持与 Page7 相同的 ChatDialog */}
      <div className={styles.rightPanel}>
        <ChatDialog
          initialBotMessage="需要帮助吗？您可以在这里查询设计理论或寻求建议。"
          onSendMessage={sideChatSendMessage}
          onDataExtracted={handleDataExtracted}
          isInputEnabled={true}
        />
      </div>
    </div>
  );
};

export default Page17_Achieve;