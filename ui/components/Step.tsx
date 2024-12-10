import React, { useState, useEffect } from 'react';
import { Disclosure, Button, TabPanel } from '@headlessui/react';

interface Step {
  title: string;
  details: string;
}

interface Message {
  message: string;
  query_combine?: string[];
  results?: string[];
  suggestions?: string[];
  end_flag: string;
}

const Step: React.FC<{ isLast: boolean; loading: boolean; query: string }> = ({
  isLast,
  loading,
  query,
}) => {
  const [message, setMessage] = useState<Message[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://api/rewrite_retrieval`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      console.log('Message from server:', event.data);
      // 假设从服务器接收到的数据是 Message 类型的数组
      setMessage(JSON.parse(event.data));
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {message.map((step, index) => (
        <Disclosure key={index}>
          {({ open }) => (
            <>
              <Disclosure.Button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              >
                {step.message}
                <span>{open ? ' ▼' : ' ▶'}</span>
              </Disclosure.Button>
              <Disclosure.Panel
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                }}
              >
                <pre>{step.results?.join('\n') || ''}</pre>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
};

export default Step;
