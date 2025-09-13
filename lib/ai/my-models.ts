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

export const qwenVLPlus = bailian('qwen-vl-plus');
