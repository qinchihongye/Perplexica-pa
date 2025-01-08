import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes));

export const formatTimeDifference = (
  date1: Date | string,
  date2: Date | string,
): string => {
  date1 = new Date(date1);
  date2 = new Date(date2);

  const diffInSeconds = Math.floor(
    Math.abs(date2.getTime() - date1.getTime()) / 1000,
  );

  if (diffInSeconds < 60)
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''}`;
  else if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) !== 1 ? 's' : ''}`;
  else if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) !== 1 ? 's' : ''}`;
  else if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) !== 1 ? 's' : ''}`;
  else
    return `${Math.floor(diffInSeconds / 31536000)} year${Math.floor(diffInSeconds / 31536000) !== 1 ? 's' : ''}`;
};


export const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
  event.preventDefault(); // 阻止默认的链接跳转行为

  const targetUrl = event.currentTarget.href;
  const token = 'd27121560bdb4d9d8a780cb24bf9a399'; 

  fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': token
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const blobUrl = window.URL.createObjectURL(blob);
    
    // 在新标签页中打开这个Blob URL
    window.open(blobUrl, '_blank');
  })
  .catch(error => console.error('Error:', error));
};