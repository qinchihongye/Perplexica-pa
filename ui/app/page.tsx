'use client';
import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';
import { Suspense, useState, useEffect } from 'react';
import Login from '@/components/Login';

import { metadata } from './metadata'; 

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查会话存储中是否存在isLoggedIn
    const sessionLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (sessionLoggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };
  return (
    <div>
     {isLoggedIn ? (
        <Suspense>
          <ChatWindow />
        </Suspense>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default Home;
