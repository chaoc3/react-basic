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
            description: '用户群体。',
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
            description: '设计痛点',
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
  
  - 当用户的回答清晰地描述了一个用户群体时，你的任务是：
    1. 使用 \`extractUserInfo\` 工具来提取这个用户群体描述。
    2. 你的最终回复**必须**是：“太好了，我们已经确定了你的设计对象。接下来，我想更了解你的设计出发点。请点击右侧按钮进入下一步吧。”
  
  - 如果用户的回答只是一个简单的问候 (例如 "你好", "hi") 或者不清晰、不相关，你的任务是：
    
    1.引导对话，向他们提出关键问题：“为了开始我们的设计，可以告诉我，你希望这个智能代理来帮助什么样的用户群体呢？他们是谁，正在经历什么？”
    2. 在这种情况下，**绝对不要**使用 \`extractUserInfo\` 工具，因为还没有可供提取的信息。`;
  
      case 'getTargetPainpoint':
        // (这里的逻辑暂时不变，但未来也可以用同样思路优化)
        return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们想要解决的问题。
        你需要问用户：“你希望这个智能代理协助的助推机制想改变的问题是什么？”
        在用户回答后，分析他们的回答。如果回答清晰地描述了一个设计痛点，就使用 extractPainPoint 工具来提取这个信息。
        成功提取后，你的最终回答必须是：“明白了，我已经了解你想聚焦的问题，这个方向很有意义。接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。点击右侧按钮进入下一步吧。”不要使用 Markdown 格式`;
  
      case 'getTargetStage':
        // (这里的逻辑暂时不变)
        return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们希望干预的行为阶段。
        首先，向用户介绍三个阶段：“  一、准备阶段：帮助用户意识到健康问题的重要性，并提供实际行动的准备支持；
  二、行动阶段：推动用户从意识到实际行动，帮助他们采取具体的健康行为，并提供行动所需的资源与支持；
  三、维持阶段：帮助用户保持并巩固健康行为，强化其长期坚持的动力和能力”。
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
      // 获取所有选择的卡片
      const allMechanismCards = Array.isArray(additionalData.mechanismCards) ? additionalData.mechanismCards : [];
      // 获取该卡片已有的详情 (前端传来的 additionalData.mechanismDetails 应该是整个大对象)
      const allDetails = additionalData.mechanismDetails || {};
      const currentCardDetails = allDetails[currentCardName] || {};

      // 计算缺失的策略
      const strategies = ['strategy1', 'strategy2', 'strategy3'];
      const filledCount = strategies.filter(k => currentCardDetails[k]).length;
      const missingStrategies = strategies.filter(k => !currentCardDetails[k]);
      
      // 判断当前卡片是否完成
      const isCurrentCardComplete = filledCount === 3;

      // 检查所有卡片的完成状态
      const cardsStatus = allMechanismCards.map(cardName => {
        const cardDetails = allDetails[cardName] || {};
        const cardFilledCount = strategies.filter(k => cardDetails[k] && cardDetails[k].trim() !== '').length;
        return {
          name: cardName,
          isComplete: cardFilledCount === 3,
          filledCount: cardFilledCount
        };
      });
      const incompleteCards = cardsStatus.filter(c => !c.isComplete);
      const allCardsComplete = incompleteCards.length === 0;

      if (isCurrentCardComplete && allCardsComplete) {
         return `你是一个辅助设计助手。
         **当前状态**：用户正在编辑助推机制卡片 **"${currentCardName}"**。
         **检测结果**：
         - 当前卡片的3个策略 **都已填写完毕**。
         - 所有选择的卡片（${allMechanismCards.join('、')}）的策略都已完善。
         
         你的任务：
         1. 简短地夸奖用户完成得很好。
         2. 提醒用户："太棒了！所有卡片的策略都已完善，你可以点击下一步继续了。"
         3. **不要**再调用工具。`;
      }

      if (isCurrentCardComplete) {
        return `你是一个辅助设计助手。
        **当前状态**：用户正在编辑助推机制卡片 **"${currentCardName}"**。
        **检测结果**：该卡片的3个策略 **都已填写完毕**。
        
        **其他卡片状态**：
        ${incompleteCards.map(c => `- ${c.name}: 已完成 ${c.filledCount}/3 个策略`).join('\n')}
        
        你的任务：
        1. 简短地夸奖用户完成得很好。
        2. 提醒用户："当前卡片已完成。你还可以切换到其他卡片继续完善策略，或者如果所有卡片都完成了，点击下一步。"
        3. **不要**再调用工具。`;
      }

      return `你是一个辅助设计方案的陪伴者。
      
      **【当前任务】**
      用户选择了助推机制：**"${currentCardName}"**。
      你需要引导用户为这张卡片补充具体的执行策略。
      
      **【已知进度】**
      - 当前卡片: ${currentCardName}
      - 已收集策略: ${JSON.stringify(currentCardDetails)}
      - 还需要收集: ${missingStrategies.join('、')}
      
      **【所有卡片状态】**
      ${cardsStatus.map(c => `- ${c.name}: ${c.isComplete ? '已完成' : `已完成 ${c.filledCount}/3 个策略`}`).join('\n')}
      
      **【对话策略】**
      1. **聚焦当前卡片**：你的所有提问必须紧扣 **"${currentCardName}"** 这个机制。
      2. **循序渐进**：
         - 如果是第一次提问，请问："对于${currentCardName}，你打算采取的第一个具体做法是什么？"
         - 如果已有部分策略，请针对缺失的部分提问（例如："好的，那第二个策略呢？"）。
      3. **提取信息**：
         - 用户回答后，**必须立即**使用 \`extractMechanismDetails\` 工具。
         - 将提取的内容对应到 \`strategy1\`, \`strategy2\` 或 \`strategy3\` 中（填补空缺）。
      
      请开始引导用户。`;
      case 'buildUserProfile': // Page 7 的任务
      const requiredFields = ['age', 'sexual', 'edu', 'work', 'equip'];
      // 确保 existingProfile 是一个对象，防止 undefined 报错
      const existingProfile = additionalData.userProfile || {};
      
      // 找出缺失的字段 (值为 null, undefined 或 空字符串)
      const missingFields = requiredFields.filter(field => 
          !existingProfile[field] || existingProfile[field].trim() === ''
      );
      
      // 字段名称映射，用于生成自然的对话
      const fieldMap = {
          'age': '年龄段',
          'sexual': '性别',
          'edu': '教育背景',
          'work': '职业类型',
          'equip': '智能设备使用熟练度'
      };

      let instruction = '';
      
      if (missingFields.length > 0) {
          // 取出第一个缺失的字段作为下一个问题的主题
          const nextField = missingFields[0];
          const nextFieldName = fieldMap[nextField];
          
          instruction = `
          **【当前状态】**
          用户画像尚未完成。
          缺失的字段有：${missingFields.map(f => fieldMap[f]).join('、')}。
          
          **【你的任务】**
          1. 你**必须**针对 **"${nextFieldName}"** 向用户提问。
          2. 问题要自然、友好。例如，如果缺"年龄"，可以问："为了更好地定制方案，请问目标用户的年龄段大概是多少？"
          3. **不要**一次性问所有问题，一次只问一个。
          `;
      } else {
          // 所有字段都存在
          instruction = `
          **【当前状态】**
          所有用户画像字段已收集完毕！
          
          **【你的任务】**
          1. 不需要再提问。
          2. 请直接回复结束语：“非常好，我们已经为用户建立了详细的画像！点击下一步继续我们的设计之旅吧。”
          `;
      }

      return `你是一个友好且聪明的辅助设计方案的陪伴者。你的任务是通过对话，帮助用户完善他们选择的用户画像。
      
      **【重要指令】**
      在用户回答了你的问题后，你必须**立即**使用 \`extractUserProfile\` 工具来提取信息。
      
      已知信息：
      - 目标用户: "${additionalData.targetUser}"
      - 已收集画像: ${JSON.stringify(existingProfile)}
      
      ${instruction}
      
      **注意：**
      - 保持语气专业且亲切。
      - **不要**使用 Markdown 格式。
      - 如果用户回答了当前问题，请务必调用工具提取。`;

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
          
          // 构建丰富的上下文，帮助 AI 生成精准的预填方案
          const contextInfo = `
          - 设计对象: ${additionalData.targetUser || '用户'}
          - 核心痛点: ${additionalData.targetPainpoint || '健康问题'}
          - 核心场景: ${additionalData.scenarioCard || '生活场景'} (${JSON.stringify(additionalData.scenarioDetails || {})})
          - 选定交互模态: ${currentMode}
          `;
    
          // 检查当前是否为空状态（即刚进入页面，还没有任何策略）
          const isEmptyState = !existingModeDetails.strategy1 && !existingModeDetails.strategy2 && !existingModeDetails.strategy3;
    
          if (isEmptyState) {
            return `你是一个专业且贴心的医疗助推设计陪伴者。
            
            **【当前任务】**
            用户选择了 **"${currentMode}"** 作为交互模态。
            你需要基于用户的设计背景，**主动为用户构思并预填写** 3个具体的交互策略
    
            **【设计背景】**
            ${contextInfo}
    
            **【你的行动步骤】**
            1. **分析与构思**：基于设计背景，思考3个符合 "${currentMode}" 特点的具体策略：
               - 策略1 (Mod-Strategy1)：核心交互形式（具体怎么做？）。
               - 策略2 (Mod-Strategy2)：触发时机或频率（什么时候做？）。
               - 策略3 (Mod-Strategy3)：反馈机制或呈现细节（给用户什么感觉？）。

            2. **生成回复**：
               - 用亲切、专业的语气告诉用户：“基于你的设计目标，我为你草拟了以下3个交互方案：”
               - 清晰列出你构思的3个策略。这三个策略每条控制在20字以内。
               - 最后询问：“你觉得这套方案可行吗？我们可以直接采用，或者你告诉我哪里需要调整。”
    
            3. **重要**：在此阶段**不要**调用工具。先展示方案，等待用户确认或修改。`;
          }
    
          // 如果不是空状态（用户已经开始修改，或者已经确认了）
          return `你是一个专业且贴心的医疗助推设计陪伴者。
    
          **【当前任务】**
          用户正在与你探讨或修改 **"${currentMode}"** 的交互策略。
    
          **【当前已知策略状态】**
          - Mod-Strategy1: ${existingModeDetails.strategy1 || '待确认'}
          - Mod-Strategy2: ${existingModeDetails.strategy2 || '待确认'}
          - Mod-Strategy3: ${existingModeDetails.strategy3 || '待确认'}
    
          **【你的行动准则】**
          1. **倾听与修改**：
             - 如果用户说“可以”、“没问题”、“就这样”，说明用户接受了方案。
             - 如果用户提出了修改意见（例如“把频率改成每天一次”）或比较模糊的提出需要修改，需要仔细提问如何修改，请理解用户的意图。
             
          2. **提取数据 (关键)**：
             - 一旦用户确认方案或提出了具体的修改内容，你必须**立即**使用工具 \`extractModeDetails\`。
             - 将最终确定的内容分别填入 \`strategy1\` (对应 Mod-Strategy1), \`strategy2\` (对应 Mod-Strategy2), \`strategy3\` (对应 Mod-Strategy3)。
             - **注意**：必须一次性提取所有3个策略（如果是确认原有方案，就提取原有方案的内容；如果是修改，就提取修改后的内容）。
          
          3. **回复用户**：
             - 调用工具后，回复：“太好了，我们已经确定了交互细节！点击下一步进入总览吧。”`;
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
              // 1. 获取已有的数据 (从前端传来的 additionalData)
              const existingProfile = additionalData.userProfile || {};
              
              // 2. 获取本次 AI 提取的新数据
              const newlyExtractedData = parsedResult.data;
              
              // 3. 【关键】合并数据：旧数据 + 新数据
              const mergedProfile = { ...existingProfile, ...newlyExtractedData };

              // 4. 定义必须填写的字段
              const requiredFields = ['age', 'sexual', 'edu', 'work', 'equip'];
              
              // 5. 检查是否所有字段都有值
              const allFieldsCollected = requiredFields.every(field => {
                const value = mergedProfile[field];
                return typeof value === 'string' && value.trim() !== '';
              });

              // 6. 更新 extractedData
              // 注意：这里我们返回 mergedProfile，这样前端更新状态时就是完整的对象，而不是只有新字段
              extractedData = { userProfile: mergedProfile };
              
              // 7. 设置任务完成状态
              isTaskComplete = allFieldsCollected;

              // 8. 设置回复文本
              if (isTaskComplete) {
                // 如果完成了，强制使用完成语 (前端收到 isTaskComplete=true 会显示下一步按钮)
                finalResponseText = taskConfig.completionMessage;
              } else {
                // 如果没完成，这里其实不需要强制设置 finalResponseText
                // 因为 AI 在上面的 Prompt 中已经被指示去问下一个问题了。
                // 这里留空，让 AI 生成的 responseText (即下一个问题) 直接返回给用户。
                // 只有当 AI 没说话时，才用兜底语。
                if (!finalResponseText) {
                   finalResponseText = '好的，已记录。让我们继续完善其他信息。';
                }
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
            // 1. 获取当前卡片名称
            const currentCardName = additionalData.currentCardName;
            if (!currentCardName) {
              console.warn('[BACKEND] buildMechanismDetails: currentCardName 缺失');
              continue;
            }
            
            // 2. 获取所有选择的卡片和已有的详情（嵌套结构：{ [cardName]: { strategy1, strategy2, strategy3 } }）
            const allMechanismCards = Array.isArray(additionalData.mechanismCards) ? additionalData.mechanismCards : [];
            const allMechanismDetails = additionalData.mechanismDetails || {};
            const currentCardDetails = allMechanismDetails[currentCardName] || {};
            
            // 3. 获取 AI 新提取的策略数据
            const newlyExtractedData = parsedResult.data; // e.g., { strategy1: "..." }
  
            // 4. 合并当前卡片的新旧策略数据
            const mergedCardDetails = { ...currentCardDetails, ...newlyExtractedData };
  
            // 5. 判断当前卡片的任务是否完成（3个strategy是否都填满）
            const requiredFields = ['strategy1', 'strategy2', 'strategy3'];
            const isCurrentCardComplete = requiredFields.every(field => {
              const value = mergedCardDetails[field];
              return typeof value === 'string' && value.trim() !== '';
            });
  
            // 6. 更新完整的 mechanismDetails 对象（包含当前卡片的更新）
            const updatedAllMechanismDetails = {
              ...allMechanismDetails,
              [currentCardName]: mergedCardDetails
            };
  
            // 7. 【关键检测】检查所有选择的卡片是否都有记录，且每张卡片的3个strategy都完成
            let allCardsHaveDetails = true;
            let allCardsComplete = true;
            
            if (allMechanismCards.length > 0) {
              // 检查每张卡片
              for (const cardName of allMechanismCards) {
                const cardDetails = updatedAllMechanismDetails[cardName];
                
                // 检查卡片是否有记录
                if (!cardDetails) {
                  allCardsHaveDetails = false;
                  allCardsComplete = false;
                  break;
                }
                
                // 检查该卡片的3个strategy是否都完成
                const cardComplete = requiredFields.every(field => {
                  const value = cardDetails[field];
                  return typeof value === 'string' && value.trim() !== '';
                });
                
                if (!cardComplete) {
                  allCardsComplete = false;
                }
              }
            }
  
            // 8. 准备返回数据（以卡片名称为key的嵌套结构）
            extractedData = { 
              mechanismDetails: {
                [currentCardName]: mergedCardDetails
              }
            };
            
            // 9. 任务完成判断：当前卡片完成 且 所有卡片都完成
            isTaskComplete = isCurrentCardComplete && allCardsComplete && allCardsHaveDetails;
  
            // 10. 构造回复
            if (isTaskComplete) {
              finalResponseText = taskConfig.completionMessage || '太棒了，所有卡片的策略都已完善！点击下一步继续吧。';
            } else if (isCurrentCardComplete) {
              // 当前卡片完成，但还有其他卡片未完成
              const incompleteCards = allMechanismCards.filter(cardName => {
                const cardDetails = updatedAllMechanismDetails[cardName];
                if (!cardDetails) return true;
                return !requiredFields.every(field => {
                  const value = cardDetails[field];
                  return typeof value === 'string' && value.trim() !== '';
                });
              });
              
              if (incompleteCards.length > 0) {
                finalResponseText = `很好！当前卡片已完成。你还可以切换到其他卡片继续完善策略。`;
              } else {
                finalResponseText = `好的，已记录。我们还需要补充其他策略。`;
              }
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