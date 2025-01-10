import React, { useState, useEffect, useRef } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import {
  ChevronDownIcon,
  GlobeAsiaAustraliaIcon,
  CheckCircleIcon,
} from '@heroicons/react/20/solid';
import { Disc3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { handleClick } from '@/lib/utils'

interface Step {
  message?: string;
  results?: Object[];
  query_combine?: string[];
  suggestions?: Object[];
  end_flag: number;
  chat_id: string;
  query?: string;
}

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

type ChildEventCallback = (eventData: string) => void;

interface StepProps {
  isLast: boolean;
  loading: boolean;
  query: string;
  steps?: Item[];
  stepLoading: boolean;
  messageId: string;
  onSeach?: ChildEventCallback
  onReady?: ChildEventCallback;
  onStepChange?: ChildEventCallback;
  isLastFrame: boolean
  onLast: ChildEventCallback
  onSteps?: (eventData: Item[]) => void;
  keysList?: string[];
}

const Step: React.FC<StepProps> = ({
  steps,
  stepLoading,
  messageId,
  loading,
  onSeach, 
  onReady,
  onStepChange,
  isLastFrame,
  onLast,
  onSteps,
  keysList,
  isLast,
}) => {
  const ownMessageIdRef = useRef<string>(messageId);
  const currentKeysRef = useRef<string[]>(keysList || []);
  const currentStepsRef = useRef<Item[]>(steps || []);
  const [_steps, setSteps] = useState<Item[]>([]);
  const [keys, setkeys] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<{ [key: string]: boolean }>({});
  const [stoped, setStoped] = useState<boolean>(false);

  useEffect(() => {
    if (messageId && !isLastFrame && isLast) {
      console.log('MessageId', messageId)
      ownMessageIdRef.current = messageId;
      onReady?.('yes');
    }

    if (!stepLoading) setStoped(true);
    if(stoped){
      return
    }

    if (!stoped && steps && loading && steps.length > 0 && !isLastFrame && isLast) {
      console.log('Steps:', steps);
      onStepChange?.(ownMessageIdRef.current);
      const s = new Set(steps);
      setSteps(Array.from(s));
      onReady?.('yes');
      currentStepsRef.current = Array.from(s);
    } else if (steps && steps.length === 0) {
      // 如果 steps 为空数组，不更新状态
      return;
    }
  }, [messageId, steps, loading, stepLoading, stoped, isLastFrame, isLast]);

  useEffect(() => {
    if (loading && !isLastFrame) {
      onSeach?.(messageId);
      const keysSet = new Set(keys);
      _steps.map((it) => {
        if (it.query) keysSet.add(it.query);
      });
      setkeys(Array.from(keysSet));
      currentKeysRef.current = Array.from(keysSet);
    }
    onSteps?.(_steps);
  }, [loading, messageId, isLastFrame, isLast]);

  useEffect(() => {
    if (keysList && keysList.length > 0 && !isLastFrame && isLast) {
      setkeys(keysList);
      onStepChange?.(ownMessageIdRef.current);
      currentKeysRef.current = keysList;
    } else if (keysList && keysList.length === 0) {
      // 如果 keysList 为空数组，不更新状态
      return;
    }
    console.log('keys', keys);
  }, [keysList, isLastFrame, isLast]);

  useEffect(()=>{
    if(isLastFrame)
      onLast('yes')
  },[isLastFrame])

  return (
    <div className="divide-y w-full divide-white/5 rounded-xl bg-white/5 mb-5 ml-0">
      {currentKeysRef.current && currentKeysRef.current.length? keys.map((key, index) => (
        <Disclosure
          key={index}
          as="div"
          className="p-3 relative"
          defaultOpen={key === '去重' ? false : true}
          // data-open={(open) => setIsOpen({ ...isOpen, [key]: open })}
          onClick={() => setIsOpen({ ...isOpen, [key]: false })}
        >
          {({ open }) => (
            <>
              <DisclosureButton className="group flex w-full items-center justify-between relative z-auto">
                <div className="flex items-center">
                  {stepLoading && isLast ? (
                    <Disc3
                      className={cn(
                        'text-black dark:text-white mr-2',
                        loading ? 'animate-spin' : 'animate-none',
                      )}
                      size={15}
                    />
                  ) : (
                    <CheckCircleIcon className="text-black dark:text-white mr-2 w-4 h-4 " />
                  )}
                  <span className="text-sm/6 font-medium text-black dark:text-white group-data-[hover]:text-black/80 dark:group-data-[hover]:text-white/80">
                    {key}
                  </span>
                </div>
                <ChevronDownIcon className="size-5 dark:fill-white/60 group-data-[hover]:fill-white/50 group-data-[open]:rotate-180" />
                {index !== keys.length - 1 && (
                  <div
                    className={clsx(
                      'absolute dark:bg-white/20 bg-black/20 w-0.5 left-1.5 top-5',
                      open && 'h-28',
                      !open && 'h-11',
                    )}
                  ></div>
                )}
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm/5 text-white/50">
                <p className="text-sm/6 font-medium dark:text-white/60 text-black ml-2 p-2">
                  {loading && isLast ? 'Reading' : 'Documents'}
                </p>
                <ul className="flex flex-row flex-wrap ml-5">
                  {currentStepsRef.current && currentStepsRef.current
                    .filter((it) => {
                      return it.query === key;
                    })
                    .map((result: any, resultIndex: number) => (
                      <div key={resultIndex} className="group relative">
                        <li
                          key={resultIndex}
                          className={`flex items-center mr-3 rounded-lg dark:bg-white/5 p-1 group-hover:underline 
                      ${resultIndex > 0 ? 'border-l border-white/10 pl-3' : ''}`}
                        >
                          <GlobeAsiaAustraliaIcon
                            className="w-4 h-4 mr-1 text-black/60 dark:text-white/80"
                            aria-hidden="true"
                          />
                          <a
                            href={
                              result.url
                            }
                            className="text-sm font-medium text-black dark:text-white hover:text-black/60 dark:hover:text-white/80"
                            target="_blank"
                            onClick={handleClick}
                          >
                            {result.title.length < 10
                              ? result.title
                              : result.title.slice(0, 10) + '...'}
                          </a>
                        </li>
                        <div className="hidden group-hover:animate-fadeIn group-hover:duration-1000 group-hover:block absolute z-10 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-2 shadow-lg w-80">
                          <p className="text-sm">
                            {result.content.length < 200
                              ? result.content
                              : result.content.slice(0, 200) + '...'}
                          </p>
                        </div>
                      </div>
                    ))}
                </ul>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      )):<p className="text-sm/6 font-medium dark:text-white/60 text-black ml-2 p-2">
      No Search
    </p>}
    </div>
  );
};

export default Step;