'use client';

/* eslint-disable @next/next/no-img-element */
import React, { MutableRefObject, useEffect, useState } from 'react';
import { Message } from './ChatWindow';
import Think from './Think';
import { cn } from '@/lib/utils';
import {
  BookCopy,
  Disc3,
  Volume2,
  StopCircle,
  Layers3,
  Plus,
} from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import Copy from './MessageActions/Copy';
import Rewrite from './MessageActions/Rewrite';
import MessageSources from './MessageSources';
import SearchImages from './SearchImages';
import SearchVideos from './SearchVideos';
import Step from './Step';
import { useSpeech } from 'react-text-to-speech';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { handleClick } from '@/lib/utils'

type DataObject<K extends string | number | symbol, V> = {
  [key in K]: V;
};

interface Item {
  query?: string;
  title?: string;
  content?: string;
  score?: Number;
  length?: Number;
  url?: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  author?: string;
  iframe_src?: string;
}

const MessageBox = ({
  message,
  messageIndex,
  history,
  loading,
  dividerRef,
  isLast,
  rewrite,
  sendMessage,
  steps,
  stepLoading,
  isLastFrame,
  onLast,
}: {
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  dividerRef?: MutableRefObject<HTMLDivElement | null>;
  isLast: boolean;
  rewrite: (messageId: string) => void;
  sendMessage: (message: string) => void;
  steps: Object[];
  stepLoading: boolean;
  isLastFrame: boolean;
  onLast: (event: string) => void;
}) => {
  const [parsedMessage, setParsedMessage] = useState(message.content);
  const [speechMessage, setSpeechMessage] = useState(message.content);
  const [messageIdList, setMessageIdList] = useState<Set<string>>(new Set());
  const [_steps, setSteps] = useState<Object[]>([])
  const [stepList, setStepList] = useState(new Set())
  const [childSteps, setChildSteps] = useState<Item[]>([]);

  const handlerSearch = (mId: string) => {
    const uniqueResults = new Set([...Array.from(messageIdList), mId]);
    setMessageIdList(uniqueResults);
  };

  const handelerReady = (status: string) => {
    if (status === 'yes') {
      setSteps(steps)
    }
  }

  const handelerStepChange = (mId: string) => {
    const uni = Array.from(stepList)
    setStepList(new Set([...uni, mId]))
  }

  const style = (mId: string) => {
    return { display: stepList.has(mId) ? 'block' : 'none' }
  }

  useEffect(() => {
    // 监听所有链接的点击事件
    const links: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a');

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement;
      const href = target.getAttribute('href');
      if(href && href.includes('display'))
        event.preventDefault(); // 阻止默认跳转行为
        handleClick(null, href || '')
    };

    links.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    // 清理事件监听器
    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, [parsedMessage]);

  useEffect(() => {
    const regex = /\[(\d+)\]/g;

    if (
      message.role === 'assistant' &&
      message?.sources &&
      message.sources.length > 0
    ) {
      return setParsedMessage(
        message.content.replace(
          regex,
          (_, number) =>
            `<a href="${message.sources?.[number - 1]?.metadata?.url}" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black/70 dark:text-white/70 relative">${number}</a>`,
        ),
      );
    }

    setSpeechMessage(message.content.replace(regex, ''));
    setParsedMessage(message.content);
  }, [message.content, message.sources, message.role]);

  const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

  return (
    <div>
      {message.role === 'user' && (
        <div>
          <div className={cn('w-full', messageIndex === 0 ? 'pt-16' : 'pt-8')}>
            <h2 className="text-black dark:text-white font-medium text-3xl lg:w-9/12">
              {message.content}
            </h2>
          </div>
          {isLast && loading ? (
            <Think initialQuery={message.content}></Think>
          ) : (
            ''
          )}
        </div>
      )}

      {(
        <div style={style(message.messageId)}>
          <div className="flex items-center mb-3">
            <MagnifyingGlassIcon
              className="w-8 h-8 mr-1 text-black/60 dark:text-white/80"
              aria-hidden="true"
            />
            <h4 className="text-black dark:text-white font-medium text-xl lg:w-9/12 ml-1">
              Search
            </h4>
          </div>
          <Step
            isLast={isLast}
            loading={loading}
            query={message.content}
            steps={steps}
            stepLoading={stepLoading}
            messageId={message.messageId}
            onSeach={handlerSearch}
            onReady={handelerReady}
            onStepChange={handelerStepChange}
            isLastFrame={isLastFrame}
            onLast={onLast}
          ></Step>
        </div>
      )
      }

      {
        message.role === 'assistant' && (
          <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
            <div
              ref={dividerRef}
              className="flex flex-col space-y-6 w-full lg:w-9/12"
            >
              {message.sources && message.sources.length > 0 && (
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-row items-center space-x-2">
                    <BookCopy className="text-black dark:text-white" size={20} />
                    <h3 className="text-black dark:text-white font-medium text-xl">
                      Sources
                    </h3>
                  </div>
                  <MessageSources sources={message.sources} />
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-2">
                  <Disc3
                    className={cn(
                      'text-black dark:text-white',
                      isLast && loading ? 'animate-spin' : 'animate-none',
                    )}
                    size={20}
                  />
                  <h3 className="text-black dark:text-white font-medium text-xl">
                    Answer
                  </h3>
                </div>
                <Markdown
                  className={cn(
                    'prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0',
                    'max-w-none break-words text-black dark:text-white text-sm md:text-base font-medium',
                  )}
                >
                  {parsedMessage}
                </Markdown>
                {loading && isLast ? null : (
                  <div className="flex flex-row items-center justify-between w-full text-black dark:text-white py-4 -mx-2">
                    <div className="flex flex-row items-center space-x-1">
                      {/*  <button className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black text-black dark:hover:text-white">
                      <Share size={18} />
                    </button> */}
                      <Rewrite rewrite={rewrite} messageId={message.messageId} />
                    </div>
                    <div className="flex flex-row items-center space-x-1">
                      <Copy initialMessage={message.content} message={message} />
                      <button
                        onClick={() => {
                          if (speechStatus === 'started') {
                            stop();
                          } else {
                            start();
                          }
                        }}
                        className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
                      >
                        {speechStatus === 'started' ? (
                          <StopCircle size={18} />
                        ) : (
                          <Volume2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {isLast &&
                  message.suggestions &&
                  message.suggestions.length > 0 &&
                  message.role === 'assistant' &&
                  !loading && (
                    <>
                      <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                      <div className="flex flex-col space-y-3 text-black dark:text-white">
                        <div className="flex flex-row items-center space-x-2 mt-4">
                          <Layers3 />
                          <h3 className="text-xl font-medium">Related</h3>
                        </div>
                        <div className="flex flex-col space-y-3">
                          {message.suggestions.map((suggestion, i) => (
                            <div
                              className="flex flex-col space-y-3 text-sm"
                              key={i}
                            >
                              <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                              <div
                                onClick={() => {
                                  sendMessage(suggestion);
                                }}
                                className="cursor-pointer flex flex-row justify-between font-medium space-x-2 items-center"
                              >
                                <p className="transition duration-200 hover:text-[#24A0ED]">
                                  {suggestion}
                                </p>
                                <Plus
                                  size={20}
                                  className="text-[#24A0ED] flex-shrink-0"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
              </div>
            </div>
            {!loading && (
              <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-4">
                <SearchImages
                  query={history[messageIndex - 1].content}
                  chatHistory={history.slice(0, messageIndex - 1)}
                />
                <SearchVideos
                  chatHistory={history.slice(0, messageIndex - 1)}
                  query={history[messageIndex - 1].content}
                />
              </div>
            )}
          </div>
        )
      }
    </div >
  );
};

export default MessageBox;
