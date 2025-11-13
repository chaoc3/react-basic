// backend/index.js

import express from 'express';
import cors from 'cors';
import { createOpenAI } from '@ai-sdk/openai';
// MODIFICATION START: 引入 generateText 用于工具调用
import { generateText } from 'ai';
// MODIFICATION END
import { z } from 'zod';
import 'dotenv/config';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const model = deepseek('deepseek-chat');

// MODIFICATION START: 将工具定义移到顶层，方便复用
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
      targetStage: z.enum(['意识提升阶段', '行为促进阶段', '行为增强阶段']).describe('用户希望聚焦的行为改变阶段。'),
    }),
  },
};

// 根据任务选择要使用的工具
const getToolForTask = (task) => {
  switch (task) {
    case 'getTargetUser':
      return { extractUserInfo: tools.extractUserInfo };
    case 'getTargetPainpoint':
      return { extractPainPoint: tools.extractPainPoint };
    case 'getTargetStage':
      return { extractBehaviorStage: tools.extractBehaviorStage };
    default:
      return {};
  }
};
// MODIFICATION END

const getSystemPromptForTask = (task) => {
  switch (task) {
    case 'getTargetUser':
      // 优化后的提示词，更强调工具使用的时机
      return `你是一个友好且聪明的辅助设计方案的陪伴者。你的核心目标是与用户对话，并从他们的回答中识别出他们想要帮助的用户群体。
- 当用户的回答清晰地描述了一个用户群体时 (例如 "为老年糖尿病患者设计" 或 "我想帮助那些刚开始健身的年轻人")，你的任务是：
  1. **必须**使用 \`extractUserInfo\` 工具来提取这个用户群体描述。
  2. 在工具调用后，你的最终回复**必须**是：“太好了，我们已经确定了你的设计对象。接下来，我想更了解你的设计出发点。”
- 如果用户的回答不清晰或只是问候，你需要引导他们，并**绝对不能**使用工具。例如提问：“为了开始我们的设计，可以告诉我，你希望这个智能代理来帮助什么样的用户群体呢？”`;

    case 'getTargetPainpoint':
      return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们想要解决的问题。
- 你需要问用户：“你希望这个智能代理协助的助推机制想改变的问题是什么？”
- 在用户清晰地回答了一个设计痛点后，**必须**使用 \`extractPainPoint\` 工具来提取这个信息。
- 成功提取后，你的最终回答**必须**是：“明白了，我已经了解你想聚焦的问题，这个方向很有意义。接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。”`;

    case 'getTargetStage':
      return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们希望干预的行为阶段。
- 首先，向用户介绍三个阶段：“意识提升阶段 - 让用户开始意识到健康问题的重要性。行为促进阶段 - 推动用户开始采取具体健康行为。行为增强阶段 - 帮助用户维持并强化健康行为”。
- 然后，问用户：“你觉得你的设计想聚焦在哪个阶段呢？可以和我聊聊你的想法。”
- 在用户回答后，分析他们的回答并判断属于哪个阶段，然后**必须**使用 \`extractBehaviorStage\` 工具来提取这个信息。
- 成功提取后，你的最终回答**必须**是：“很好，这样我们就更清楚你的设计目标了。接下来，让我们点击右侧按钮进入下一步吧。”`;
      
    default:
      return '你是一个乐于助人的助手。';
  }
};

// MODIFICATION START: 重写 /chat 路由以支持真正的工具调用
app.post('/api/chat', async (req, res) => {
  console.log("\n--- [BACKEND] Express API /api/chat 被调用 ---");
  try {
    const { messages, task } = req.body;
    console.log(`[BACKEND] 收到任务: ${task}`);

    if (!task) {
      return res.status(400).json({ error: "任务 (task) 是必须的。" });
    }

    const systemPrompt = getSystemPromptForTask(task);
    const toolForTask = getToolForTask(task);

    const { text, toolCalls } = await generateText({
      model: model,
      system: systemPrompt,
      messages: messages,
      tools: toolForTask,
    });

    let responseText = text;
    let extractedData = null;
    let isTaskComplete = false;

    if (toolCalls && toolCalls.length > 0) {
      console.log("[BACKEND] AI 请求调用工具:", toolCalls);
      isTaskComplete = true; // 后端开关：只要成功调用工具，就认为任务完成
      
      // 假设每次只调用一个工具
      const toolCall = toolCalls[0];
      extractedData = toolCall.args; // 提取的数据就是工具的参数
      
      // AI 在调用工具后，text 内容可能为空，我们需要返回系统提示中指定的最终回复
      if (task === 'getTargetUser') {
        responseText = "太好了，我们已经确定了你的设计对象。接下来，我想更了解你的设计出发出。";
      } else if (task === 'getTargetPainpoint') {
        responseText = "明白了，我已经了解你想聚焦的问题，这个方向很有意义。接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。";
      } else if (task === 'getTargetStage') {
        responseText = "很好，这样我们就更清楚你的设计目标了。接下来，让我们点击右侧按钮进入下一步吧。";
      }

    } else {
      console.log("[BACKEND] AI 未调用工具，仅返回文本。");
    }

    const responsePayload = {
      responseText,
      extractedData,
      isTaskComplete, // 这个就是控制前端跳转的“开关”
    };

    console.log("[BACKEND] 准备返回数据:", responsePayload);
    return res.json(responsePayload);

  } catch (error) {
    console.error("[BACKEND] 在 API 路由中捕获到严重错误:", error);
    return res.status(500).json({ 
      error: "服务器内部错误。",
      details: error.message 
    });
  }
});
// MODIFICATION END

app.listen(port, () => {
  console.log(`✅ Backend server is running at http://localhost:${port}`);
});