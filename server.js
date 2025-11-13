import express from 'express';
import cors from 'cors';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import 'dotenv/config';

const app = express();
const port = 3001;

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
  extractUserProfile: { /* ... 定义 ... */ },
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

};

// 定义不同任务的系统提示
const getSystemPromptForTask = (task) => {
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
        成功提取后，你的最终回答必须是：“明白了，我已经了解你想聚焦的问题，这个方向很有意义。接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。点击右侧按钮进入下一步吧。”`;
  
      case 'getTargetStage':
        // (这里的逻辑暂时不变)
        return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们希望干预的行为阶段。
        首先，向用户介绍三个阶段：“意识提升阶段 - 让用户开始意识到健康问题的重要性。行为促进阶段 - 推动用户开始采取具体健康行为。行为增强阶段 - 帮助用户维持并强化健康行为”。
        然后，问用户：“你觉得你的设计想聚焦在哪个阶段呢？可以和我聊聊你的想法。”
        在用户回答后，分析他们的回答并判断属于哪个阶段，然后使用 extractBehaviorStage 工具来提取这个信息。
        成功提取后，你的最终回答必须是：“很好，这样我们就更清楚你的设计目标了。接下来，让我们点击右侧按钮进入下一步吧。”`;
        
      case 'recommendUserGroup': // Page 6 的提示词
        return `你是一个辅助设计方案的陪伴者。你的任务是基于用户之前确定的设计目标，向他们推荐一个合适的用户群体。
        用户的设计目标是：“${additionalData.targetUser}”。
        你的回复应该是引导性的，例如：“根据你‘${additionalData.targetUser}’的目标，我为你推荐了几个可能的用户画像。你可以看看左边的卡片，选择一个最符合你想法的。”
        保持友好和引导的语气。不要使用任何工具。`;

      case 'buildUserProfile': // Page 7 的提示词
        return `你是一个辅助设计方案的陪伴者。你的任务是通过对话，帮助用户完善他们选择的用户画像。
        已知信息如下：
        - 用户的设计目标 (Target-User): "${additionalData.targetUser}"
        - 用户选择的画像卡片 (User): "${additionalData.user}"

        你的流程应该是：
        1. **分析已有信息**：基于以上两点，推断出一些基本信息（例如，提到“糖尿病患者”，可能年龄段偏大）。将这些推断出的信息作为预填写内容，并向用户确认：“根据我们已知的信息，我为你预填写了一些内容，看看是否准确？我们也可以随时修改。”
        2. **逐一提问**：依次询问那些还**未知**的信息：年龄段、性别、教育背景、职业类型、智能设备使用熟练度。一次只问一个问题。
        3. **提取信息**：在用户的每次回答后，使用 \`extractUserProfile\` 工具来提取对应的信息。你可以多次调用这个工具，每次只填充一部分字段。
        4. **完成对话**：当所有五个字段（age, sexual, edu, work, equip）都被提取后，你的最终回复**必须**是：“非常好，我们已经为用户建立了详细的画像！点击下一步继续我们的设计之旅吧。”`;
      default:
        return '你是一个乐于助人的助手。';
    }
  };

// 创建 API 路由
app.post('/api/chat', async (req, res) => {
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
            extractedData = taskConfig.transform(parsedResult.data);
            isTaskComplete = true;
            break;
          } catch (parseError) {
            console.warn(`[BACKEND] 工具 ${name} 参数 JSON 解析失败:`, parseError);
          }
        }
      }

      let finalResponseText = responseText;
      if (isTaskComplete && !finalResponseText) {
        finalResponseText = taskConfig?.completionMessage || '好的，我们已经完成了这一步。';
      }

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

app.listen(port, () => {
  console.log(`✅ Backend server is running at http://localhost:${port}`);
});