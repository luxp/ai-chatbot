import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { gateway } from '@ai-sdk/gateway';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';
import { qwen3Plus } from './models';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': qwen3Plus,
        'chat-model-reasoning': wrapLanguageModel({
          model: qwen3Plus,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': qwen3Plus,
        'artifact-model': qwen3Plus,
      },
    });
