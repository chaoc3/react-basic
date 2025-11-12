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

const tools = {
    extractUserInfo: {
      description: '根据用户的描述提取目标用户群体的信息。',
      parameters: z.object({
        targetUser: z.string().describe('一句话描述的用户群体，例如 "需要管理血糖的年轻糖尿病患者"。'),
      }),
    },
    extractPainPoint: {
      description: '根据用户的描述提取他们想要解决的设计痛点或健康问题。',
      parameters: z.object({
        targetPainpoint: z.string().describe('一句话描述的设计痛点，例如 "难以坚持每日测量血糖"。'),
      }),
    },
    extractBehaviorStage: {
      description: '根据用户的描述，判断他们希望干预的行为改变阶段。',
      parameters: z.object({
        targetStage: z.string().describe('用户希望聚焦的行为改变阶段，例如 "意识提升阶段"、"行为促进阶段" 或 "行为增强阶段"。'),
      }),
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
  
      const { messages, task } = req.body;
      console.log(`[BACKEND] 收到任务: ${task}`);
  
      const systemPrompt = getSystemPromptForTask(task);
      
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
  
      // 简单的工具调用模拟（实际需要更复杂的逻辑）
      let extractedData = null;
      if (task === 'getTargetUser' && responseText.includes('用户群体')) {
        extractedData = { 'Target-User': '模拟提取的用户群体' };
      }

      // 其他工具的类似处理...
  
      console.log("[BACKEND] 准备返回数据:", { responseText, extractedData });
      return res.json({ responseText, extractedData });
  
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