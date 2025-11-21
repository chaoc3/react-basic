import express from 'express';
import cors from 'cors';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import 'dotenv/config';

const app = express();
//const port = 3001;

app.use(cors());
app.use(express.json());

// 使用 OpenAI 兼容的方式创建 DeepSeek 客户端
const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com/v1', // DeepSeek API 端点
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 创建模型实例 - 确保 model 是字符串
const model = deepseek('deepseek-chat'); // 使用正确的模型名称

const toolSchemas = {
  extractUserInfo: z.object({
    targetUser: z.string().describe('一句话描述的用户群体，例如 "需要管理血糖的年轻糖尿病患者"。'),
  }),
  extractPainPoint: z.object({
    targetPainpoint: z.string().describe('一句话描述的设计痛点，例如 "难以坚持每日测量血糖"。'),
  }),
  extractBehaviorStage: z.object({
    targetStage: z.string().describe('用户希望聚焦的行为改变阶段，例如 "意识提升阶段"、"行为促进阶段" 或 "行为增强阶段"。'),
  }),
  extractUserChoice: z.object({
    user: z.string().describe('用户选择的用户画像卡片名称，例如 "慢病患者"。'),
  }),
  extractUserProfile: z.object({
    age: z.string().optional().describe('用户的年龄段'),
    sexual: z.string().optional().describe('用户的性别'),
    edu: z.string().optional().describe('用户的教育背景'),
    work: z.string().optional().describe('用户的职业类型'),
    equip: z.string().optional().describe('用户的智能设备使用熟练度'),
  }),
  extractScenarioDetails: z.object({
    when: z.string().optional().describe('场景发生的时间，例如 "早上"、"饭后"'),
    where: z.string().optional().describe('场景发生的地点，例如 "厨房"、"办公室"'),
    who: z.string().optional().describe('场景发生时在场的人物，例如 "家人"、"同事"'),
  }),
  extractInfoSourceDetails: z.object({
    strategy1: z.string().optional().describe('第一个信息源的具体数据点，例如 "每日饮水量"'),
    strategy2: z.string().optional().describe('第二个信息源的具体数据点，例如 "每周运动时长"'),
    strategy3: z.string().optional().describe('第三个信息源的具体数据点，例如 "专家建议的卡路里摄入量"'),
}),
extractModeDetails: z.object({
    strategy1: z.string().optional().describe('第一个交互方式的具体描述，例如 "每日推送卡片"'),
    strategy2: z.string().optional().describe('第二个交互方式的具体描述，例如 "语音提醒"'),
    strategy3: z.string().optional().describe('第三个交互方式的具体描述，例如 "视觉化图表"'),
}),
extractMechanismDetails: z.object({
    
    strategy1: z.string().optional().describe('第一个策略的具体做法'),
    strategy2: z.string().optional().describe('第二个策略的具体做法'),
    strategy3: z.string().optional().describe('第三个策略的具体做法'),
}),
extractRecommendedCards: z.object({
  recommendedCards: z.array(z.string()).describe('An array of exactly three recommended card names.'),
}),

};


const toolDefinitions = {
  extractUserInfo: {
    type: 'function',
    function: {
      name: 'extractUserInfo',
      description: '根据用户的描述提取目标用户群体的信息。',
      parameters: {
        type: 'object',
        properties: {
          targetUser: {
            type: 'string',
            description: '一句话描述的用户群体，例如 "需要管理血糖的年轻糖尿病患者"。',
          },
        },
        required: ['targetUser'],
      },
    },
  },
  extractPainPoint: {
    type: 'function',
    function: {
      name: 'extractPainPoint',
      description: '根据用户的描述提取他们想要解决的设计痛点或健康问题。',
      parameters: {
        type: 'object',
        properties: {
          targetPainpoint: {
            type: 'string',
            description: '一句话描述的设计痛点，例如 "难以坚持每日测量血糖"。',
          },
        },
        required: ['targetPainpoint'],
      },
    },
  },
  extractBehaviorStage: {
    type: 'function',
    function: {
      name: 'extractBehaviorStage',
      description: '根据用户的描述，判断他们希望干预的行为改变阶段。',
      parameters: {
        type: 'object',
        properties: {
          targetStage: {
            type: 'string',
            description: '用户希望聚焦的行为改变阶段，例如 "意识提升阶段"、"行为促进阶段" 或 "行为增强阶段"。',
          },
        },
        required: ['targetStage'],
      },
    },
  },
  extractUserChoice: { /* ... 定义 ... */ },
  
  extractUserProfile: {
    type: 'function',
    function: {
      name: 'extractUserProfile',
      description: '根据用户的描述提取用户的基本信息。',
      parameters: {
        type: 'object',
        properties: {
          age: { type: 'string', description: '用户的年龄段' }, // 确保是 string
          sexual: { type: 'string', description: '用户的性别' },
          edu: { type: 'string', description: '用户的教育背景' },
          work: { type: 'string', description: '用户的职业类型' },
          equip: { type: 'string', description: '用户的智能设备使用熟练度' },
        },
        // 关键：这里不应该有 required 字段，因为它们都是可选的
        // required: ['age', 'sexual', 'edu', 'work', 'equip'], // 确保没有这行或只包含必须字段
      },
    },
  },
    extractScenarioDetails: {
      type: 'function',
      function: {
          name: 'extractScenarioDetails',
          description: '根据用户的描述提取场景的细节信息。',
          parameters: {
              type: 'object',
              properties: {
                  when: { type: 'string', description: '场景发生的时间' },
                  where: { type: 'string', description: '场景发生的地点' },
                  who: { type: 'string', description: '场景发生时在场的人物' },
              },
          },
      },
  },
  extractInfoSourceDetails: {
    type: 'function',
    function: {
        name: 'extractInfoSourceDetails',
        description: '根据用户的描述提取信息源的具体数据点。',
        parameters: {
            type: 'object',
            properties: {
                strategy1: { type: 'string', description: '第一个信息源的具体数据点' },
                strategy2: { type: 'string', description: '第二个信息源的具体数据点' },
                strategy3: { type: 'string', description: '第三个信息源的具体数据点' },
            },
        },
    },
},
extractModeDetails: {
    type: 'function',
    function: {
        name: 'extractModeDetails',
        description: '根据用户的描述提取交互模态的具体策略。',
        parameters: {
            type: 'object',
            properties: {
                strategy1: { type: 'string', description: '第一个交互方式的具体描述' },
                strategy2: { type: 'string', description: '第二个交互方式的具体描述' },
                strategy3: { type: 'string', description: '第三个交互方式的具体描述' },
            },
        },
    },
},
  extractMechanismDetails: {
    type: 'function',
    function: {
      name: 'extractMechanismDetails',
      description: '根据用户输入提取当前助推机制的具体策略。',
      parameters: {
        type: 'object',
        properties: {

          strategy1: { type: 'string', description: '第一个策略' },
          strategy2: { type: 'string', description: '第二个策略' },
          strategy3: { type: 'string', description: '第三个策略' },
        },
        // --- 确保 cardName 是必须的 ---
        
      },
    },
  },
  extractRecommendedCards: {
    type: 'function',
    function: {
      name: 'extractRecommendedCards',
      description: 'Extract the names of the three recommended mechanism cards.',
      parameters: {
        type: 'object',
        properties: {
          recommendedCards: {
            type: 'array',
            items: { type: 'string' },
            description: 'An array of exactly three recommended card names, e.g., ["反馈与激励", "社会影响", "目标设定"]',
          },
        },
        required: ['recommendedCards'],
      },
    },
  },

};

const taskConfigs = {
  getTargetUser: {
    toolName: 'extractUserInfo',
    completionMessage: '太好了，我们已经确定了你的设计对象。接下来，我想更了解你的设计出发点。请点击右侧按钮进入下一步吧。',
    transform: (data) => ({ targetUser: data.targetUser }),
  },
  getTargetPainpoint: {
    toolName: 'extractPainPoint',
    completionMessage: '明白了，我已经了解你想聚焦的问题，这个方向很有意义。接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。点击右侧按钮进入下一步吧。',
    transform: (data) => ({ targetPainpoint: data.targetPainpoint }),
  },
  getTargetStage: {
    toolName: 'extractBehaviorStage',
    completionMessage: '很好，这样我们就更清楚你的设计目标了。接下来，让我们点击右侧按钮进入下一步吧。',
    transform: (data) => ({ targetStage: data.targetStage }),
  },
  recommendUserGroup: { // Page 6 的任务
    // 这个任务比较特殊，它不需要工具，只是纯对话
    // 我们可以在前端处理卡片选择，然后将结果作为下一个任务的输入
  },
  buildUserProfile: { // Page 7 的任务
    toolName: 'extractUserProfile',
    completionMessage: '非常好，我们已经为用户建立了详细的画像！点击下一步继续我们的设计之旅吧。',
    transform: (data) => ({ userProfile: data }), // 返回一个包含 userProfile 对象的对象
  },


  buildInfoSourceDetails: {
      toolName: 'extractInfoSourceDetails',
      completionMessage: '太棒了，我们已经确定了信息依据！点击下一步继续吧。',
      transform: (data) => ({ infoSourceDetails: data }),
  },

  buildScenarioDetails: {
    toolName: 'extractScenarioDetails',
    completionMessage: '太棒了，我们已经确定了场景细节！点击下一步继续吧。',
    transform: (data) => ({ scenarioDetails: data }),
  },
  buildModeDetails: {
      toolName: 'extractModeDetails',
      completionMessage: '太棒了，我们已经完善了交互方式！点击下一步进入总览吧。',
      transform: (data) => ({ modeDetails: data }),
  },
  generateFinalReport: {
    toolName: null, // 不需要工具
    completionMessage: '设计方案已生成。',
    transform: (data) => ({ finalReport: data }), // 假设 AI 直接返回文本
  },
  buildMechanismDetails: {
    toolName: 'extractMechanismDetails',
    // 注意：这里的 completionMessage 只是兜底，主要逻辑在 Prompt 中控制
    completionMessage: '当前卡片的策略已完善。', 
    transform: (data) => ({ mechanismDetails: data }), // 返回扁平数据，前端负责挂载到对应卡片下
  },
recommendScenario: { // For Page 8
  toolName: null, // No tool needed, just text
},
recommendMechanisms: { // For Page 10
  toolName: 'extractRecommendedCards',
  transform: (data) => ({ recommendedCards: data.recommendedCards }),
},
recommendInfoSources: {
  toolName: 'extractRecommendedCards', // 复用 Page 10 的工具，因为它也是推荐多个卡片
  transform: (data) => ({ recommendedCards: data.recommendedCards }),
},
recommendMode: {
  toolName: null, // 不需要工具，AI 直接生成推荐文本
},

};

// 定义不同任务的系统提示
const getSystemPromptForTask = (task, additionalData = {}) => {
    switch (task) {
      case 'getTargetUser':
        return `你是一个友好且聪明的辅助设计方案的陪伴者。你的核心目标是与用户对话，并从他们的回答中识别出他们想要帮助的用户群体。
  
  - 当用户的回答清晰地描述了一个用户群体时 (例如 "为老年糖尿病患者设计" 或 "我想帮助那些刚开始健身的年轻人")，你的任务是：
    1. 使用 \`extractUserInfo\` 工具来提取这个用户群体描述。
    2. 你的最终回复**必须**是：“太好了，我们已经确定了你的设计对象。接下来，我想更了解你的设计出发点。请点击右侧按钮进入下一步吧。”
  
  - 如果用户的回答只是一个简单的问候 (例如 "你好", "hi") 或者不清晰、不相关，你的任务是：
    1. 用友好、自然的语气回应他们的问候。
    2. **然后**，引导对话，向他们提出关键问题：“为了开始我们的设计，可以告诉我，你希望这个智能代理来帮助什么样的用户群体呢？他们是谁，正在经历什么？”
    3. 在这种情况下，**绝对不要**使用 \`extractUserInfo\` 工具，因为还没有可供提取的信息。`;
  
      case 'getTargetPainpoint':
        // (这里的逻辑暂时不变，但未来也可以用同样思路优化)
        return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们想要解决的问题。
        你需要问用户：“你希望这个智能代理协助的助推机制想改变的问题是什么？”
        在用户回答后，分析他们的回答。如果回答清晰地描述了一个设计痛点，就使用 extractPainPoint 工具来提取这个信息。
        成功提取后，你的最终回答必须是：“明白了，我已经了解你想聚焦的问题，这个方向很有意义。接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。点击右侧按钮进入下一步吧。”不要使用 Markdown 格式`;
  
      case 'getTargetStage':
        // (这里的逻辑暂时不变)
        return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们希望干预的行为阶段。
        首先，向用户介绍三个阶段：“意识提升阶段 - 让用户开始意识到健康问题的重要性。行为促进阶段 - 推动用户开始采取具体健康行为。行为增强阶段 - 帮助用户维持并强化健康行为”。
        然后，问用户：“你觉得你的设计想聚焦在哪个阶段呢？可以和我聊聊你的想法。”
        在用户回答后，分析他们的回答并判断属于哪个阶段，然后使用 extractBehaviorStage 工具来提取这个信息。
        成功提取后，你的最终回答必须是：“很好，这样我们就更清楚你的设计目标了。接下来，让我们点击右侧按钮进入下一步吧。”`;
        
      case 'recommendUserGroup': // Page 6 的任务
        return `你是一个辅助设计方案的陪伴者。你的任务是基于用户之前确定的设计目标，向他们推荐一个合适的用户群体。
        用户的设计目标是：“${additionalData.targetUser}”。
        你的回复应该是引导性的，例如：“根据你‘${additionalData.targetUser}’的目标，我为你推荐了几个可能的用户画像。你可以看看左边的卡片，选择一个最符合你想法的。”
        保持友好和引导的语气。不要使用任何工具。不要使用 Markdown 格式`;

        case 'buildMechanismDetails':
      // 获取当前正在编辑的卡片名称
      const currentCardName = additionalData.currentCardName;
      // 获取该卡片已有的详情 (前端传来的 additionalData.mechanismDetails 应该是整个大对象)
      const allDetails = additionalData.mechanismDetails || {};
      const currentCardDetails = allDetails[currentCardName] || {};

      // 计算缺失的策略
      const strategies = ['strategy1', 'strategy2', 'strategy3'];
      const filledCount = strategies.filter(k => currentCardDetails[k]).length;
      const missingStrategies = strategies.filter(k => !currentCardDetails[k]);
      
      // 判断当前卡片是否完成
      const isCurrentCardComplete = filledCount === 3;

      if (isCurrentCardComplete) {
         return `你是一个辅助设计助手。
         **当前状态**：用户正在编辑助推机制卡片 **“${currentCardName}”**。
         **检测结果**：该卡片的3个策略 **都已填写完毕**。
         
         你的任务：
         1. 简短地夸奖用户完成得很好。
         2. 提醒用户：“这张卡片的内容已经完善了，你可以点击左右箭头切换到其他卡片继续填写，或者如果所有卡片都完成了，点击下一步。”
         3. **不要**再调用工具。`;
      }

      return `你是一个辅助设计方案的陪伴者。
      
      **【当前任务】**
      用户选择了助推机制：**“${currentCardName}”**。
      你需要引导用户为这张卡片补充具体的执行策略。
      
      **【已知进度】**
      - 当前卡片: ${currentCardName}
      - 已收集策略: ${JSON.stringify(currentCardDetails)}
      - 还需要收集: ${missingStrategies.join('、')}
      
      **【对话策略】**
      1. **聚焦当前卡片**：你的所有提问必须紧扣 **“${currentCardName}”** 这个机制。
      2. **循序渐进**：
         - 如果是第一次提问，请问：“对于${currentCardName}，你打算采取的第一个具体做法是什么？”
         - 如果已有部分策略，请针对缺失的部分提问（例如：“好的，那第二个策略呢？”）。
      3. **提取信息**：
         - 用户回答后，**必须立即**使用 \`extractMechanismDetails\` 工具。
         - 将提取的内容对应到 \`strategy1\`, \`strategy2\` 或 \`strategy3\` 中（填补空缺）。
      
      请开始引导用户。`;
      case 'buildUserProfile': // Page 7 的任务
    // ----------------------------------------------------------------
    // 关键修改：移除固定流程，强调根据缺失字段提问
    // ----------------------------------------------------------------
        const requiredFields = ['age', 'sexual', 'edu', 'work', 'equip'];
        const existingProfile = additionalData.userProfile || {};
        
        // 找出缺失的字段
        const missingFields = requiredFields.filter(field => 
            existingProfile[field] == null || existingProfile[field].trim() === ''
        );
        
        let nextQuestionInstruction = '';
        if (missingFields.length > 0) {
            // 引导 AI 提问第一个缺失的字段
            const nextMissingField = missingFields[0];
            const fieldMap = {
                'age': '年龄段',
                'sexual': '性别',
                'edu': '教育背景',
                'work': '职业类型',
                'equip': '智能设备使用熟练度'
            };
            nextQuestionInstruction = `你必须根据当前缺失的字段，向用户提出下一个问题。当前缺失的字段有：${missingFields.map(f => fieldMap[f]).join('、')}。你的下一个问题必须是关于**${fieldMap[nextMissingField]}**的。`;
        } else {
            nextQuestionInstruction = `所有信息已收集完毕。你的最终回复必须是：“非常好，我们已经为用户建立了详细的画像！点击下一步继续我们的设计之旅吧。”`;
        }

        return `你是一个友好且聪明的辅助设计方案的陪伴者。你的任务是通过对话，帮助用户完善他们选择的用户画像。
        
        **【重要指令】在用户回答了你提出的任何一个画像字段后，你必须立即使用 \`extractUserProfile\` 工具来提取该信息。**
        
        已知信息如下：
        - 用户的设计目标 (Target-User): "${additionalData.targetUser}"
        - 用户选择的画像卡片 (User): "${additionalData.user}"
        - 当前已收集的画像信息: ${JSON.stringify(existingProfile)}
        
        你的回复必须遵循以下原则：
        1. **如果用户提供了新的画像信息**：提取信息后，${nextQuestionInstruction}
        2. **如果用户没有提供信息（例如首次加载或简单问候）**：你必须主动提出第一个缺失字段的问题。
        3. **保持友好和引导的语气。**
        4. **不要使用 Markdown 格式。**
          ${nextQuestionInstruction}`; 
      case 'buildScenarioDetails':
        return `你是一个辅助设计方案的陪伴者。你的任务是通过对话，帮助用户完善他们选择的场景细节。
        
        **【重要指令】在用户回答了你提出的任何一个场景字段（时间、地点、人物）后，你必须立即使用 \`extractScenarioDetails\` 工具来提取该信息。**
        
        已知信息如下：
        - 用户的设计目标 (Target-User): "${additionalData.targetUser}"
        - 用户选择的画像卡片 (User): "${additionalData.user}"
        - 用户选择的场景卡片 (Scenario): "${additionalData.scenarioCard}"
        - 当前已收集的场景信息: ${JSON.stringify(additionalData.scenarioDetails || {})}
        
        你的回复必须遵循以下原则：
        1. **首次回复**：基于已知信息，向用户提出第一个缺失的场景细节问题（时间、地点或人物）。
        2. **逐一提问**：依次询问那些还**未知**的信息：什么时候最容易发生？在哪里发生？当时通常还有谁在你身边？
        3. **提取信息**：在用户的每次回答后，**必须**使用 \`extractScenarioDetails\` 工具来提取对应的信息。
        4. **完成对话**：当所有三个字段（when, where, who）都被提取后，你的最终回复**必须**是：“太棒了，我们已经确定了场景细节！点击下一步继续吧。”不要使用 Markdown 格式。`;


        case 'buildInfoSourceDetails':
          // 获取用户选择的那张唯一卡片的名字
          const currentCard = additionalData.infoSourceCards && additionalData.infoSourceCards.length > 0 
              ? additionalData.infoSourceCards[0] 
              : '选定的信息源';
  
          return `你是一个辅助设计方案的陪伴者。
          
          **【任务目标】**
          用户选择了信息源：“${currentCard}”。
          你的任务是引导用户为这个信息源提供 **3个具体的、不同的可追踪数据点**。
          
          **【已知信息】**
          - 当前信息源: ${currentCard}
          - 当前已收集的数据点: ${JSON.stringify(additionalData.infoSourceDetails || {})}
          
          **【对话策略】**
          1. **逐一询问**：不要一次性问三个问题。
             - 如果是一个空对象，请问第一个核心数据点。
             - 如果已有 strategy1，请问第二个补充数据点。
             - 如果已有 strategy1 和 strategy2，请问最后一个数据点。
          2. **提取规则**：
             - 用户的第1个回答 -> 提取为 \`strategy1\`
             - 用户的第2个回答 -> 提取为 \`strategy2\`
             - 用户的第3个回答 -> 提取为 \`strategy3\`
          3. **完成条件**：只有当 strategy1, strategy2, strategy3 全都不为空时，你的最终回复才是：“太棒了，我们已经确定了所有信息依据！点击下一步继续吧。”
          
          请保持专业且引导性强的语气。`;

        case 'buildModeDetails':
        const currentMode = additionalData.modeCard || '选定的交互方式';
        const existingModeDetails = additionalData.modeDetails || {};
        
        // 1. 动态判断当前缺少哪个策略 (逻辑前置，减轻 AI 负担)
        let nextFieldToFill = 'strategy1';
        let nextFieldDescription = '第一个核心策略（具体实现方式）';
        
        if (existingModeDetails.strategy1) {
            nextFieldToFill = 'strategy2';
            nextFieldDescription = '第二个策略（如频率、触发时机或其他补充）';
        }
        if (existingModeDetails.strategy2) {
            nextFieldToFill = 'strategy3';
            nextFieldDescription = '第三个策略（如反馈机制或更多细节）';
        }
        
        // 如果全满了
        if (existingModeDetails.strategy1 && existingModeDetails.strategy2 && existingModeDetails.strategy3) {
             return `你是一个专家。所有策略都已收集完毕。
             请直接回复：“太棒了，我们已经完善了交互方式！点击下一步进入总览吧。”
             不要调用任何工具。`;
        }

        return `你是一个严谨的数据提取助手。
        
        **【当前状态】**
        - 交互模态: "${currentMode}"
        - 已收集策略: ${JSON.stringify(existingModeDetails)}
        - **当前目标**: 必须提取用户的输入作为 **\`${nextFieldToFill}\`**。
        
        **【你的行动准则】**
        1. 用户刚才的回答 **就是** \`${nextFieldToFill}\` 的内容。
        2. **必须立即** 使用工具 \`extractModeDetails\`，并将内容赋值给 \`${nextFieldToFill}\` 参数。
        3. **严禁** 仅在回复中说“已记录”，而不调用工具。没有工具调用 = 任务失败。
        
        **【回复示例】**
        (假设用户说“每天晚上8点推送”)
        工具调用: extractModeDetails({ ${nextFieldToFill}: "每天晚上8点推送" })
        回复文本: "好的，已记录为${nextFieldDescription}。接下来..."
        
        现在，请处理用户的输入，并提取为 \`${nextFieldToFill}\`。`;
      case 'generateFinalReport':
        // 格式化所有收集到的数据
        const collectedData = {
            '设计目标': {
                '用户群体': additionalData.targetUser,
                '核心痛点': additionalData.targetPainpoint,
                '切入阶段': additionalData.targetStage,
            },
            '用户与场景': {
                '用户画像': additionalData.user,
                '画像细节': additionalData.userProfile,
                '核心场景': additionalData.scenarioCard,
                '场景细节': additionalData.scenarioDetails,
            },
            '助推策略': {
                '核心机制': additionalData.mechanismCards,
                '机制策略': additionalData.mechanismDetails,
                '信息依据': additionalData.infoSourceCards,
                '信息策略': additionalData.infoSourceDetails,
                '交互方式': additionalData.modeCard,
                '交互策略': additionalData.modeDetails,
            }
        };
    
        return `你是一个智能代理设计助手，你的任务是根据用户提供的所有设计决策，生成一份结构完整、逻辑清晰的“智能代理助推设计方案”报告。
        
        模块一：设计概述
          用2-3句话概括：为谁设计？在什么场景下？想达到什么目标？
        模块二：助推实施路径
          描述助推如何发生：什么情况下触发？通过什么方式呈现给用户？具体如何影响用户行为？
        模块三：预期效果与评估
          说明如何判断设计是否成功：预期用户会有什么改变？用什么指标来衡量效果？
        
        **【数据来源】**
        以下是用户在流程中确定的所有设计决策，你必须将这些信息整合到报告中：
        ${JSON.stringify(collectedData, null, 2)}
        
        **【风格要求】**
        1. 使用专业、清晰、友好的语气。
        2. **必须使用 Markdown 格式**（标题、列表、粗体），以确保报告结构清晰。
        3. 报告内容必须是连贯的叙述性文本，而不是简单地罗列 JSON 数据。
        
        请开始生成报告。`;
        

      case 'recommendUserGroup': // Page 6 的任务
        // --- 修改开始 ---
        // 构建一个更详细的上下文描述字符串
        let context = `用户的设计目标是帮助“${additionalData.targetUser}”`;
        if (additionalData.targetPainpoint) {
            context += `，解决“${additionalData.targetPainpoint}”这个问题`;
        }
        if (additionalData.targetStage) {
            context += `，并且聚焦在“${additionalData.targetStage}”`;
        }
        context += '。';

        return `你是一个辅助设计方案的陪伴者。你的任务是基于用户之前确定的设计目标，向他们推荐一个合适的用户群体。
        ${context}
        你的回复应该是简短、友好且引导性的，鼓励用户从左边的卡片中选择。例如：“根据你的设计目标，我为你推荐了几个可能的用户画像。你可以看看左边的卡片，选择一个最符合你想法的。”
        **不要**详细分析每个卡片，你的任务只是引出选择。
        保持友好和引导的语气。不要使用任何工具。不要使用 Markdown 格式。`;


        case 'recommendScenario':
        return `你是一个辅助设计方案的陪伴者。你的任务是基于用户已经确定的用户画像，为他们推荐一个最相关的核心场景。

        已知信息如下：
        - 设计目标: "${additionalData.targetUser}"
        - 用户画像: "${additionalData.user}"
        - 画像细节: ${JSON.stringify(additionalData.userProfile)}

        可推荐的场景卡片有：'居家场景', '工作场景', '户外场景', '医疗场景', '社区场景', '多场景'。

        你的回复应该是简短、友好且引导性的，鼓励用户从左边的卡片中选择一个。
        例如：“考虑到用户是‘${additionalData.user}’，并且他们的核心痛点与日常生活紧密相关，我建议我们可以从‘居家场景’开始构思。请在左侧选择你认为最合适的场景。”
        **不要**使用任何工具。你的回复就是最终的引导语。`;

      // --- NEW CASE FOR PAGE 10 ---
      case 'recommendMechanisms':
        return `你是一个专业的数字健康设计师。你的任务是根据用户至今为止的所有设计决策，为他们推荐三个最有效、最匹配的助推机制。

        已知信息如下：
        - 设计目标: "${additionalData.targetUser}"
        - 用户画像: "${additionalData.user}" (${JSON.stringify(additionalData.userProfile)})
        - 核心场景: "${additionalData.scenarioCard}" (${JSON.stringify(additionalData.scenarioDetails)})

        可推荐的助推机制卡片有：'情景感知提醒', '反馈与激励', '决策简化', '社会影响', '认知重建与反思', '目标设定', '激发好奇心', '诱饵效应'。

        你的任务分为两步：
        1.  **生成对话**: 生成一段友好的对话，解释你为什么推荐这三个机制。简要说明每个机制如何与用户的画像和场景相结合。
        2.  **调用工具**: **必须**使用 \`extractRecommendedCards\` 工具，将你推荐的**三个机制的完整名称**以数组的形式提取出来。

        例如，你的回复应该是这样的（对话 + 工具调用）：
        "根据用户的居家场景和他们需要长期坚持的目标，我为你推荐了'反馈与激励'、'目标设定'和'社会影响'这三个策略。'目标设定'可以帮助他们建立清晰的计划，'反馈与激励'能提供持续的动力，而'社会影响'则能通过家人朋友的支持来巩固效果。请在左侧选择你最认可的机制吧。"
        [工具调用: extractRecommendedCards(recommendedCards: ["反馈与激励", "目标设定", "社会影响"])]`;


      case 'recommendInfoSources':
        return `你是一位数字疗法设计师。你的任务是根据用户的所有设计决策，推荐最合适的 **1到2个** 信息源，以支持他们选择的助推机制。

        已知信息如下：
        - 设计目标: "${additionalData.targetUser}"
        - 核心痛点: "${additionalData.targetPainpoint}"
        - 用户画像: "${additionalData.user}" (${JSON.stringify(additionalData.userProfile)})
        - 核心场景: "${additionalData.scenarioCard}" (${JSON.stringify(additionalData.scenarioDetails)})
        - 已选助推机制: ${additionalData.mechanismCards.join('、')}

        可推荐的信息源卡片有：'自我数据', '他人影响', '专家干预'。

        你的任务分为两步：
        1.  **生成对话**: 生成一段友好的对话，解释你为什么推荐这几个信息源。
        2.  **调用工具**: **必须**使用 \`extractRecommendedCards\` 工具，将你推荐的 **1到2个** 信息源的完整名称以数组的形式提取出来。`;

      // --- 为 Page 14 新增的 Prompt ---
      case 'recommendMode':
        return `你是一位人机交互专家。你的任务是根据用户至今为止的所有设计决策，为他们推荐 **一个最匹配** 的交互模态。

        已知信息如下：
        - 设计目标: "${additionalData.targetUser}"
        - 用户画像与设备熟练度: ${JSON.stringify(additionalData.userProfile)}
        - 核心场景: "${additionalData.scenarioCard}" (${JSON.stringify(additionalData.scenarioDetails)})
        - 已选助推机制: ${additionalData.mechanismCards.join('、')}
        - 已选信息源: ${additionalData.infoSourceCards.join('、')}

        可推荐的交互模态卡片有：'文本交互', '语言交互', '视觉交互', '多模态交互'。

        你的回复应该是**一段简短、友好、引导性**的对话。直接在对话中点明你推荐的交互模态，并用一句话解释原因。
        例如：“考虑到用户需要在‘${additionalData.scenarioCard}’中快速获取‘${additionalData.infoSourceCards[0]}’信息，我推荐使用‘视觉交互’，因为它最直观高效。请在左侧选择你认为最合适的交互方式。”
        **不要**使用任何工具。`;









      default:
        return '你是一个乐于助人的助手。';
    }
  };

// 创建 API 路由
app.post('/chat', async (req, res) => {
    console.log("\n--- [BACKEND] Express API /api/chat 被调用 ---");
    try {
      if (!process.env.DEEPSEEK_API_KEY) {
        console.error("[BACKEND] 严重错误: DEEPSEEK_API_KEY 环境变量未设置!");
        return res.status(500).json({ error: "Server configuration error: API key is missing." });
      }
      console.log("[BACKEND] DEEPSEEK_API_KEY 已加载。");
  
      const { messages, task,...additionalData } = req.body;
      console.log(`[BACKEND] 收到任务: ${task}`);
  
      const systemPrompt = getSystemPromptForTask(task, additionalData);
      
      // 准备请求数据
      const requestData = {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: false, // 先不使用流式响应
        temperature: 0.7
      };

      const taskConfig = taskConfigs[task];
      if (taskConfig) {
        const toolDefinition = toolDefinitions[taskConfig.toolName];
        if (toolDefinition) {
          requestData.tools = [toolDefinition];
          requestData.tool_choice = 'auto';
        }
      }
  
      // 直接调用 DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(requestData)
      });
  
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      const responseText = data.choices[0]?.message?.content || '';
      let finalResponseText = responseText;
      let extractedData = null;
      let isTaskComplete = false;

      if (taskConfig) {
        const toolCalls = data.choices[0]?.message?.tool_calls || [];
        for (const call of toolCalls) {
          const { type, function: fn } = call || {};
          if (type !== 'function' || !fn) continue;
          const { name, arguments: args } = fn;
          if (name !== taskConfig.toolName) continue;

          try {
            const parsedArgs = JSON.parse(args || '{}');
            const schema = toolSchemas[name];
            if (!schema) continue;
            const parsedResult = schema.safeParse(parsedArgs);
            if (!parsedResult.success) {
              console.warn(`[BACKEND] 工具 ${name} 参数解析失败:`, parsedResult.error.flatten());
              continue;
            }

            // ----------------------------------------------------------------
            // 关键修改：针对 buildUserProfile 任务的特殊处理
            // ----------------------------------------------------------------
            if (task === 'buildUserProfile') {
              const existingProfile = additionalData.userProfile || {};
              const newlyExtractedData = parsedResult.data;
              const mergedProfile = { ...existingProfile, ...newlyExtractedData };

              const requiredFields = ['age', 'sexual', 'edu', 'work', 'equip'];
              const allFieldsCollected = requiredFields.every(field => {
                const value = mergedProfile[field];
                return typeof value === 'string' && value.trim() !== '';
              });

              extractedData = taskConfig.transform(newlyExtractedData);
              isTaskComplete = allFieldsCollected;

              if (isTaskComplete) {
                finalResponseText = taskConfig.completionMessage;
              } else {
                finalResponseText = '好的，我已记录您的信息。请继续补充下一项用户画像细节。';
              }
          } 

            else if (task === 'buildScenarioDetails') {
              const existingDetails = additionalData.scenarioDetails || {};
              const newlyExtractedData = parsedResult.data;
              const mergedDetails = { ...existingDetails, ...newlyExtractedData };

              const requiredFields = ['when', 'where', 'who'];
              const allFieldsCollected = requiredFields.every(field => {
                const value = mergedDetails[field];
                return typeof value === 'string' && value.trim() !== '';
              });

              extractedData = taskConfig.transform(newlyExtractedData);
              isTaskComplete = allFieldsCollected;

              if (isTaskComplete) {
                finalResponseText = taskConfig.completionMessage;
              } else {
                finalResponseText = '好的，我已记录您的信息。请继续补充下一个场景细节。';
              }
          }
          else if (task === 'buildInfoSourceDetails') {
            const existingDetails = additionalData.infoSourceDetails || {};
            const newlyExtractedData = parsedResult.data;
            
            // 1. 合并数据
            const mergedDetails = { ...existingDetails, ...newlyExtractedData };

            // 2. 【核心逻辑】针对单张卡片，必须填满这三个槽位
            const requiredFields = ['strategy1', 'strategy2', 'strategy3'];

            // 3. 检查完整性 (使用 mergedDetails，修复之前的 mergedProfile 报错)
            const allFieldsCollected = requiredFields.every(field => {
              const value = mergedDetails[field];
              return typeof value === 'string' && value.trim() !== '';
            });

            extractedData = { infoSourceDetails: mergedDetails };
            isTaskComplete = allFieldsCollected;

            if (isTaskComplete) {
                finalResponseText = taskConfig.completionMessage;
            } else {
                // 4. 简单的进度反馈
                // 计算当前已填写的数量
                let filledCount = 0;
                if (mergedDetails.strategy1) filledCount++;
                if (mergedDetails.strategy2) filledCount++;
                if (mergedDetails.strategy3) filledCount++;

                // 如果 AI 没有返回文本（通常不会发生，因为 Prompt 会生成），兜底回复
                if (!finalResponseText) {
                    finalResponseText = `好的，已记录第 ${filledCount} 个点。请继续告诉我下一个具体的数据点是什么？`;
                }
            }
        }
      
      // 任务 4: buildModeDetails
      else if (task === 'buildModeDetails') {
        const existingDetails = additionalData.modeDetails || {};
        const newlyExtractedData = parsedResult.data;
        
        // 1. 合并数据
        const mergedDetails = { ...existingDetails, ...newlyExtractedData };

        // 2. 【强制检查】必须填满 3 个策略
        const requiredFields = ['strategy1', 'strategy2', 'strategy3'];
        
        // 3. 检查完整性 (注意使用 mergedDetails，不要用 mergedProfile)
        const allFieldsCollected = requiredFields.every(field => 
            mergedDetails[field] != null && mergedDetails[field].trim() !== ''
        );

        extractedData = { modeDetails: mergedDetails };
        isTaskComplete = allFieldsCollected;

        if (isTaskComplete) {
            finalResponseText = taskConfig.completionMessage;
        } else {
            // 4. 构造进度提示
            let filledCount = 0;
            if (mergedDetails.strategy1) filledCount++;
            if (mergedDetails.strategy2) filledCount++;
            if (mergedDetails.strategy3) filledCount++;
            
            // 如果 AI 没有返回引导语，兜底回复
            if (!finalResponseText) {
                const currentMode = additionalData.modeCard || '交互方式';
                finalResponseText = `好的，已记录 ${filledCount}/3 个策略。针对${currentMode}，下一个具体的实现细节是什么？`;
            }
        }
    }
          else if (task === 'buildMechanismDetails') {
            // 1. 获取已有的扁平策略对象
            const existingDetails = additionalData.mechanismDetails || {};
            
            // 2. 获取 AI 新提取的策略数据
            const newlyExtractedData = parsedResult.data; // e.g., { strategy1: "..." }
  
            // 3. 直接将新旧策略合并成一个新的扁平对象
            const mergedDetails = { ...existingDetails, ...newlyExtractedData };
  
            // 4. 判断任务是否完成
            const requiredFields = ['strategy1', 'strategy2', 'strategy3'];
            const allFieldsCollected = requiredFields.every(field => {
              const value = mergedDetails[field];
              return typeof value === 'string' && value.trim() !== '';
            });
  
            // 5. 准备返回数据 (返回的是扁平对象)
            extractedData = { mechanismDetails: mergedDetails };
            isTaskComplete = allFieldsCollected;
  
            // 6. 构造回复
            if (isTaskComplete) {
              finalResponseText = taskConfig.completionMessage;
            } else {
              finalResponseText = `好的，已记录。我们还需要补充其他策略。`;
            }
          }
            else {
                // 其他任务（如 getTargetUser, getTargetPainpoint）保持原有的简单逻辑
                extractedData = taskConfig.transform(parsedResult.data);
                isTaskComplete = true;
            }
            
            break; // 退出循环，只处理第一个工具调用
          } catch (parseError) {
            console.warn(`[BACKEND] 工具 ${name} 参数 JSON 解析失败:`, parseError);
          }
        }
      }

      
      // ----------------------------------------------------------------
      // 关键修改：移除固定回复逻辑，让 AI 的回复 (responseText) 成为最终回复
      // ----------------------------------------------------------------
      
      // 只有在 AI 没有返回任何文本，但任务已完成时，才使用默认完成消息
      if (isTaskComplete && !finalResponseText) {
        finalResponseText = taskConfig?.completionMessage || '好的，我们已经完成了这一步。';
      }

      // 如果 AI 仍然没有返回文本，则使用默认的“不理解”消息
      if (!finalResponseText) {
        finalResponseText = '抱歉，我暂时没有理解清楚，能再详细描述一下吗？';
      }
  
      console.log("[BACKEND] 准备返回数据:", { responseText: finalResponseText, extractedData, isTaskComplete });
      return res.json({ responseText: finalResponseText, extractedData, isTaskComplete });
  
    } catch (error) {
      console.error("[BACKEND] 在 API 路由中捕获到严重错误:", error);
      return res.status(500).json({ 
        error: "An internal server error occurred.",
        details: error.message 
      });
    }
  });

/* app.listen(port, () => {
  console.log(`✅ Backend server is running at http://localhost:${port}`);
}); */

export default app;