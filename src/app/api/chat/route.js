// src/app/api/chat/route.js
import { createDeepseek } from '@deepseek/deepseek-react';
import { streamText } from 'ai';
import { z } from 'zod';

// 确保在服务器端从环境变量中获取 API 密钥
const deepseek = createDeepseek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 定义 AI 可以使用的工具的结构 (Schema)
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
      return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们的设计目标。
      第一步，你需要问用户：“你希望这个智能代理来帮助什么样的用户群体呢？”
      在用户回答后，分析他们的回答。如果回答清晰地描述了一个用户群体，就使用 extractUserInfo 工具来提取这个信息。
      成功提取后，你的最终回答必须是：“太好了，我们已经确定了你的设计对象。接下来，我想更了解你的设计出发点。请点击右侧按钮进入下一步吧。”
      如果用户回答不清晰，继续追问以获得更明确的描述。`;
    case 'getTargetPainpoint':
      return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们想要解决的问题。
      你需要问用户：“你希望这个智能代理协助的助推机制想改变的问题是什么？”
      在用户回答后，分析他们的回答。如果回答清晰地描述了一个设计痛点，就使用 extractPainPoint 工具来提取这个信息。
      成功提取后，你的最终回答必须是：“明白了，我已经了解你想聚焦的问题，这个方向很有意义。接下来，我们来看看你的设计希望在行为改变的哪个阶段发挥作用吧。点击右侧按钮进入下一步吧。”`;
    case 'getTargetStage':
      return `你是一个辅助设计方案的陪伴者。你的任务是引导用户确定他们希望干预的行为阶段。
      首先，向用户介绍三个阶段：“意识提升阶段 - 让用户开始意识到健康问题的重要性。行为促进阶段 - 推动用户开始采取具体健康行为。行为增强阶段 - 帮助用户维持并强化健康行为”。
      然后，问用户：“你觉得你的设计想聚焦在哪个阶段呢？可以和我聊聊你的想法。”
      在用户回答后，分析他们的回答并判断属于哪个阶段，然后使用 extractBehaviorStage 工具来提取这个信息。
      成功提取后，你的最终回答必须是：“很好，这样我们就更清楚你的设计目标了。接下来，让我们点击右侧按钮进入下一步吧。”`;
    default:
      return '你是一个乐于助人的助手。';
  }
};


export async function POST(req) {
  const { messages, task } = await req.json();

  const model = deepseek('deep-chat');
  const systemPrompt = getSystemPromptForTask(task);
  
  // 根据任务选择要使用的工具
  let toolToUse;
  if (task === 'getTargetUser') toolToUse = { extractUserInfo: tools.extractUserInfo };
  if (task === 'getTargetPainpoint') toolToUse = { extractPainPoint: tools.extractPainPoint };
  if (task === 'getTargetStage') toolToUse = { extractBehaviorStage: tools.extractBehaviorStage };

  const result = await streamText({
    model,
    system: systemPrompt,
    messages,
    tools: toolToUse,
  });

  // 将 Vercel AI SDK 的流式响应转换为前端需要的格式
  // 注意：这里的实现是为了匹配你现有的 ChatDialog，它不处理流式响应。
  // 我们将等待完整的响应和工具调用结果。
  let responseText = '';
  let extractedData = null;

  for await (const part of result.fullStream) {
    if (part.type === 'text-delta') {
      responseText += part.textDelta;
    } else if (part.type === 'tool-call') {
        // AI 决定使用工具
        if (part.toolName === 'extractUserInfo') {
            extractedData = { 'Target-User': part.args.targetUser };
        }
        if (part.toolName === 'extractPainPoint') {
            extractedData = { 'Target-Painpoint': part.args.targetPainpoint };
        }
        if (part.toolName === 'extractBehaviorStage') {
            extractedData = { 'Target-Stage': part.args.targetStage };
        }
    }
  }

  return Response.json({
    responseText,
    extractedData,
  });
}