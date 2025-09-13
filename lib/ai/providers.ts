import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { isTestEnvironment } from '../constants';
import { qwenVLPlus } from './my-models';

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require('./models.mock');
      return customProvider({
        languageModels: {
          'chat-model': chatModel,
          'chat-model-reasoning': reasoningModel,
          'title-model': titleModel,
          'artifact-model': artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        'qwen-vl-plus': qwenVLPlus,
        'chat-model': qwenVLPlus,
        'chat-model-reasoning': wrapLanguageModel({
          model: qwenVLPlus,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': qwenVLPlus,
        'artifact-model': qwenVLPlus,
      },
    });
