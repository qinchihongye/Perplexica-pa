import React, { useState, useEffect, useCallback } from 'react';
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
}) => {
  const [_steps, setSteps] = useState<Item[]>([]);
  const [keys, setkeys] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<{ [key: string]: boolean }>({});
  const [ownMessageId, setOwnMessageId] = useState<string>('');
  const [stoped, setStoped] = useState<boolean>(false);

  useEffect(() => {
    // setOwnMessageId(messageId);
    // if (ownMessageId.length<1) {
    //   if (messageId) {
    //     console.log('MessageId', messageId)
    //     setOwnMessageId(messageId);
    //     onReady?onReady('yes'):null
    //   }
    //   else if(messageId==='sp'){
    //     onReady?onReady('yes'):null
    //   }
    // }
    setOwnMessageId(messageId);
    if (messageId && ownMessageId!=='sp') {
      console.log('MessageId', messageId)
      setOwnMessageId(messageId);
      onReady?onReady('yes'):null
    }

    if (!stepLoading) setStoped(true);
    if(stoped){
      return
    }

    if (
      // messageId == ownMessageId &&
      // !stoped &&
      steps &&
      loading &&
      steps.length > 0
    ) {
      console.log('Steps:', steps);
      onStepChange?onStepChange(ownMessageId):null
      const s = new Set(steps)
      setSteps(Array.from(s));
      onReady?onReady('yes'):null
      // const keysSet = new Set(keys);
      // steps.map((it) => {
      //   if (it.query) keysSet.add(it.query);
      // });
      // setkeys(Array.from(keysSet));
      // console.log('Keys', keys);
    }
  }, [messageId, ownMessageId, steps, loading, ownMessageId, stepLoading, stoped]);

  useEffect(() => {
    if (loading) {
      onSeach?onSeach(messageId):null
      const keysSet = new Set(keys);
      _steps.map((it) => {
        if (it.query) keysSet.add(it.query);
      });
      setkeys(Array.from(keysSet));
      // console.log('Keys', keys);
    }
    onSteps?onSteps(_steps):null;
  }, [loading, messageId]);

  // }, [_steps, loading, messageId, ownMessageId]);


  useEffect(() => {
   if(keysList && keysList.length>0){
    setkeys(keysList)
    // onReady?onReady('yes'):null
   }
   console.log('keys', keys)
  }, [keysList]);

  useEffect(()=>{
    if(isLastFrame)
      onLast('yes')
  },[isLastFrame])

  return (
    <div className="divide-y w-full divide-white/5 rounded-xl bg-white/5 mb-5 ml-0">
      {keys.length?keys.map((key, index) => (
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
                  {/* {steps && steps.length == index + 1 ? ( */}
                  {stepLoading ? (
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
                {/* 步骤条 */}
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
                  {loading ? 'Reading' : 'Documents'}
                </p>
                <ul className="flex flex-row flex-wrap ml-5">
                  {_steps
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
                              // result.url.split('/display/')[0] +
                              // '/display/' +
                              // encodeURIComponent(
                              //   result.url.split('/display/')[1],
                              // )
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
                        {/* 弹出层内容 */}
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
