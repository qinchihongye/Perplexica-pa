import React, { useState, useEffect } from 'react';

// 定义 Message 接口，假设 data 是一个包含步骤信息的对象数组
interface Step {
  title: string;
  details: string;
}

interface Message {
  data: Step[];
}

// QueryList 组件
const QueryList: React.FC<{ message: Message }> = ({ message }) => {
  // 状态：用于存储每个步骤的展开状态
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  // 切换步骤的展开状态
  const toggleStep = (index: number) => {
    setExpandedSteps((prevExpanded) =>
      prevExpanded.includes(index)
        ? prevExpanded.filter((i) => i !== index)
        : [...prevExpanded, index],
    );
  };

  // 当 message 发生变化时，重置展开状态
  useEffect(() => {
    setExpandedSteps([]);
  }, [message]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {message.data.map((step, index) => (
        <div
          key={index}
          style={{
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <button
            onClick={() => toggleStep(index)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {step.title}
            {expandedSteps.includes(index) ? ' ▼' : ' ▶'}
          </button>
          {expandedSteps.includes(index) && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
              }}
            >
              <pre>{step.details}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QueryList;
