import { Message } from '@/components/ChatWindow';

// 返回一个新的数组，删除每个 Message 对象的 sources 字段
const removeSourcesField = (chatHistory: Message[]): Message[] => {
  return chatHistory.map((message) => {
    // 创建一个新对象，复制除 sources 以外的所有字段
    const { sources, ...rest } = message;
    return rest;
  });
};

export const getSuggestions = async (chatHisory: Message[]) => {
  //定义一个变量并将 chatHisory 赋值给它
  const history = chatHisory;
  console.log('原始聊天历史:', JSON.stringify(history, null, 2));
  //调用 removeSourcesField 函数，删除每个 Message 对象的 sources 字段
  const source_deleted_history = removeSourcesField(history);
  console.log('删除 sources 字段后的聊天历史:', JSON.stringify(source_deleted_history, null, 2));
  //截取最后两条消息(最近一轮)
  const lastTwoHistory = source_deleted_history.slice(-2);
  console.log('最近一轮的聊天历史:', JSON.stringify(lastTwoHistory, null, 2));


  const chatModel = localStorage.getItem('chatModel');
  const chatModelProvider = localStorage.getItem('chatModelProvider');

  const customOpenAIKey = localStorage.getItem('openAIApiKey');
  const customOpenAIBaseURL = localStorage.getItem('openAIBaseURL');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatHistory: lastTwoHistory,
      chatModel: {
        provider: chatModelProvider,
        model: chatModel,
        ...(chatModelProvider === 'custom_openai' && {
          customOpenAIKey,
          customOpenAIBaseURL,
        }),
      },
    }),
  });

  const data = (await res.json()) as { suggestions: string[] };

  return data.suggestions;
};
