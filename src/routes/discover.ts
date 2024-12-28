import express from 'express';
import { searchSearxng } from '../lib/searxng';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = (
      await Promise.all([
        searchSearxng('保险行业最新动态', { //site:businessinsider.com AI
          engines: ['bing news'],
          pageno: 1,
        }),
        searchSearxng('健康保险政策更新', {//site:www.exchangewire.com AI
          engines: ['bing news'],
          pageno: 1,
        }),
        searchSearxng('寿险市场趋势分析', {//site:yahoo.com AI
          engines: ['bing news'],
          pageno: 1,
        }),
        searchSearxng('养老保险改革新闻', {//site:businessinsider.com tech
          engines: ['bing news'],
          pageno: 1,
        }),
        searchSearxng('互联网保险创新案例', {//site:www.exchangewire.com tech
          engines: ['bing news'],
          pageno: 1,
        }),
        searchSearxng('全球保险科技发展', {//site:yahoo.com tech
          engines: ['bing news'],
          pageno: 1,
        }),
      ])
    )
      .map((result) => result.results)
      .flat()
      .sort(() => Math.random() - 0.5);

    return res.json({ blogs: data });
  } catch (err: any) {
    logger.error(`Error in discover route: ${err.message}`);
    return res.status(500).json({ message: 'An error has occurred' });
  }
});

export default router;
