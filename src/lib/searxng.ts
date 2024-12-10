import axios from 'axios';
import { getSelfSearchUrl, getPyPort } from '../config';

interface SearxngSearchOptions {
  categories?: string[];
  engines?: string[];
  language?: string;
  pageno?: number;
}

interface SearxngSearchResult {
  title: string;
  url: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
  iframe_src?: string;
}

export const searchSearxng = async (
  query: string | string[],
  opts?: SearxngSearchOptions,
) => {
  if (typeof query === 'string') {
    // 如果 query 是字符串类型，将其转换为单元素数组
    if (query.startsWith('[') && query.endsWith(']')) query = JSON.parse(query);
    else query = [query];
  } else if (!Array.isArray(query)) {
    // 如果 query 既不是字符串也不是字符串数组，抛出一个错误。
    throw new Error('query必须是 【字符串 】或者 【字符串数组】！！！！！');
  }

  // const url = "http://localhost:8013/retrieval";
  const urlroot = getSelfSearchUrl();
  const pyport = getPyPort();
  const url = urlroot + ':' + pyport + '/retrieval';

  console.log('python 服务检索的url：', url);
  const payload = {
    query_list: query,
  };

  try {
    const response = await axios.post(url, payload);
    const results = response.data.results;
    const suggestions = response.data.suggestions;
    return { results, suggestions };
  } catch (error) {
    console.error('这里出现错误:', error);
    throw error;
  }
};

// // 调用 searchSearxng 函数
// async function performSearch() {
//   const query = '中国平安2023年业绩'; // 你的搜索查询
//   const options: SearxngSearchOptions = {
//       categories: ['general', 'news'], // 可选的搜索类别
//       engines: ['bing', 'google'],       // 可选的搜索引擎
//       language: 'zh-CN',       // 可选的搜索语言
//       pageno: 1                // 可选的页码
//   };

//   try {
//       const response = await searchSearxng(query, options);
//       console.log('搜索结果:', response.results);
//       console.log('response 的 type',typeof response);
//       console.log('results 的 type',typeof response.results);
//       console.log('results 的 type333',typeof response.suggestions);
//   } catch (error) {
//       console.error('搜索出错:', error);
//   }
// }

// // 执行搜索
// performSearch();
