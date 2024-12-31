import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { getOpenaiApiKey } from '../../config';
import logger from '../../utils/logger';
import { getOpenaiBaseUrl } from '../../config';

export const loadOpenAIChatModels = async () => {
  const openAIApiKey = getOpenaiApiKey();

  if (!openAIApiKey) return {};

  try {
    const chatModels = {
      'qwen2.5-72b-instruct': {
        displayName: 'qwen2.5-72b-instruct',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'qwen2.5-72b-instruct',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'qwen-long': {
        displayName: 'Qwen-Long',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'qwen-long',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'gpt-3.5-turbo': {
        displayName: 'GPT-3.5 Turbo',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'gpt-3.5-turbo',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'gpt-4': {
        displayName: 'GPT-4',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'gpt-4',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'gpt-4-turbo': {
        displayName: 'GPT-4 turbo',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'gpt-4-turbo',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'gpt-4o': {
        displayName: 'GPT-4 omni',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'gpt-4o',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'gpt-4o-mini': {
        displayName: 'GPT-4 omni mini',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'gpt-4o-mini',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'moonshot-v1-8k': {
        displayName: 'moonshot-v1-8k',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'moonshot-v1-8k',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'moonshot-v1-32k': {
        displayName: 'moonshot-v1-32k',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'moonshot-v1-32k',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'moonshot-v1-128k': {
        displayName: 'moonshot-v1-128k',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'moonshot-v1-128k',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },
      'deepseek-chat': {
        displayName: 'deepseek-chat',
        model: new ChatOpenAI({
          openAIApiKey,
          modelName: 'deepseek-chat',
          temperature: 0.7,
        },{
          baseURL: getOpenaiBaseUrl()
        }),
      },

    };

    return chatModels;
  } catch (err) {
    logger.error(`Error loading OpenAI models: ${err}`);
    return {};
  }
};

export const loadOpenAIEmbeddingsModels = async () => {
  const openAIApiKey = getOpenaiApiKey();

  if (!openAIApiKey) return {};

  try {
    const embeddingModels = {
      'text-embedding-3-small': {
        displayName: 'Text Embedding 3 Small',
        model: new OpenAIEmbeddings({
          openAIApiKey,
          modelName: 'text-embedding-3-small',
        }),
      },
      'text-embedding-3-large': {
        displayName: 'Text Embedding 3 Large',
        model: new OpenAIEmbeddings({
          openAIApiKey,
          modelName: 'text-embedding-3-large',
        }),
      },
    };

    return embeddingModels;
  } catch (err) {
    logger.error(`Error loading OpenAI embeddings model: ${err}`);
    return {};
  }
};
