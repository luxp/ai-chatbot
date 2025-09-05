export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Grok Vision',
    description: 'Advanced multimodal model with vision and text capabilities',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Grok Reasoning',
    description:
      'Uses advanced chain-of-thought reasoning for complex problems',
  },
];

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const bailian = createOpenAICompatible({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.BAILIAN_API_KEY,
  name: 'bailian',
});

const lmStudio = createOpenAICompatible({
  baseURL: 'http://local-server.luxianpo.com:1234/v1/',
  name: 'lm-studio',
});

export const qwen3Plus = bailian('qwen-vl-plus');
export const lmStudioPlus = lmStudio('deepseek-chat');
export const qwen38b = lmStudio('qwen/qwen3-8b');
