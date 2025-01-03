'use client';
import React, { useState } from 'react';

const LoginForm: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // 简单的登录验证逻辑
    if (username == process.env.NEXT_PUBLIC_ADMIN && password == process.env.NEXT_PUBLIC_PASSWORD) {
      onLogin();
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 dark:bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">登录</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label className="block text-gray-700">用户名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {setUsername(e.target.value); setError('') }}
            className="mt-2 w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">密码:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-300 rounded"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="button"
          onClick={handleLogin}
          onKeyDown={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          登录
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
