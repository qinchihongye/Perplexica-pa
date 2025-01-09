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

  fetch(`/doc/display${targetUrl.split('display')[1]}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token': process.env.NEXT_PUBLIC_VERIFYTOKEN as string,
      'Access-Control-Allow-Origin': '*'
    },
    // mode: 'no-cors'
  })
  .then(response => response.text())
  .then(text => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>JSON Data</title>
  <style>
    body { font-family: monospace; white-space: pre; }
  </style>
</head>
<body>
  <pre>${text}</pre>
</body>
</html>
`;
    console.log(htmlContent)
    
    const htmlBlob = new Blob([text], { type: 'text/html' });
    const htmlBlobUrl = window.URL.createObjectURL(htmlBlob);
    
    window.open(htmlBlobUrl, '_blank');
  })
  .catch(error => console.error('Error:', error));
};