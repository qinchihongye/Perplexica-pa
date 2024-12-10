import React, { useState, useEffect, useCallback } from 'react';
import { Disc3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const url = `/api/rewrite_query`; // Assuming the API endpoint is correctly set

interface DataProps {
  query: string;
}

interface ResponseProps {
  query_combine?: string[];
  message: string;
  code?: number;
}

const Think: React.FC<{
  initialQuery: string;
}> = ({ initialQuery }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');
  const [queryCombineStep, setQueryCombineStep] = useState<string>('');
  const [queryCombine, setQueryCombine] = useState<string[]>([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const states = ['问题分析', '全网搜索', '问题整理'];

  // 使用 useCallback 来缓存 fetchData 函数
  const fetchData = useCallback(async () => {
    if (!initialQuery || localStorage.getItem('query') == initialQuery) return;
    localStorage.setItem('query', initialQuery);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: initialQuery }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: ResponseProps = await response.json();
      if (result.query_combine) {
        setQueryCombine(result.query_combine);
      }
      setCurrentStep((prevStep) => prevStep + 1);
      setIsDataFetched(true);
    } catch (e) {
      console.error('Fetching data failed:', e);
    } finally {
      localStorage.setItem('query', '');
    }
  }, [initialQuery]); // 依赖项为 initialQuery

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8031/...');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!isDataFetched) {
      fetchData();
    }
  }, [fetchData, isDataFetched]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    // if (loading && isLast) {
    intervalId = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : ''));
    }, 500);
    // }

    return () => clearInterval(intervalId);
  }, [currentStep]);

  useEffect(() => {
    let index = 0;
    const displayQueryCombineStep = () => {
      if (index < queryCombine.length) {
        setQueryCombineStep(`  ${queryCombine[index]}`);
        index++;
        setTimeout(displayQueryCombineStep, 500); // 设置延迟时间为1000毫秒
      } else {
        setQueryCombineStep('');
      }
    };

    if (queryCombine.length > 0 && queryCombineStep === '') {
      displayQueryCombineStep();
    }
  }, [queryCombine]);

  return (
    <div>
      {true && (
        <div>
          <br></br>
          {/* currentStep===0时显示 */}
          {currentStep > -1 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Disc3
                className={cn('text-black dark:text-white', 'animate-spin')}
                size={15}
              />
              <p style={{ marginLeft: '8px' }}>
                {states[0]}
                <span
                  style={{ color: queryCombineStep ? '#818888' : 'inherit' }}
                >
                  {queryCombineStep ? queryCombineStep : dots}
                </span>
              </p>
            </div>
          )}
          {/* currentStep>0时显示 */}
          {currentStep > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Disc3
                className={cn('text-black dark:text-white', 'animate-spin')}
                size={15}
              />
              <p style={{ marginLeft: '8px' }}>{states[1] + dots}</p>
            </div>
          )}
          {/* currentStep>1时显示 */}
          {currentStep > 1 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Disc3
                className={cn('text-black dark:text-white', 'animate-spin')}
                size={15}
              />
              <p style={{ marginLeft: '8px' }}>{states[2] + dots}</p>
            </div>
          )}
        </div>
      )}
      <br />
    </div>
  );
};

export default Think;
