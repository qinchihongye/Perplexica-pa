import React, { useState, useEffect, useCallback } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDownIcon, LinkIcon } from '@heroicons/react/20/solid';
import { Disc3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  message?: string;
  results?: Object[];
  query_combine?: string[];
  suggestions?: Object[];
  end_flag: number;
  chat_id: string;
}

interface StepProps {
  isLast: boolean;
  loading: boolean;
  query: string;
  step?: Object;
}

const Step: React.FC<StepProps> = ({ isLast, loading, query, step }) => {
  const [steps, setSteps] = useState<Object>({});
  const [stepLoading, setStepLoading] = useState<boolean>(true);

  const stepDataHandler = useCallback(
    (step: Step) => {
      if (step.end_flag === 1) {
        setStepLoading(false);
      } else {
        setStepLoading(true);
      }
      if (step.message) {
        const newSteps = { ...steps };
        if (newSteps[step.message]) {
          newSteps[step.message] = newSteps[step.message].concat(step.results);
        } else {
          newSteps[step.message] = [];
        }
        setSteps(newSteps);
        console.log(newSteps);
      }
    },
    [step],
  );

  useEffect(() => {
    if (step) {
      stepDataHandler(step as Step);
    }
  }, [step]);

  return (
    <div className="mx-auto w-full divide-y divide-white/5 rounded-xl bg-white/5">
      {Object.keys(steps).map((key, index) => (
        <Disclosure key={index} as="div" className="p-6" defaultOpen={true}>
          <DisclosureButton className="group flex w-full items-center justify-between">
            <div className="flex items-center">
              <Disc3
                className={cn(
                  'text-black dark:text-white mr-2',
                  stepLoading ? 'animate-spin' : 'animate-none',
                )}
                size={15}
              />
              <span className="text-sm/6 font-medium text-white group-data-[hover]:text-white/80">
                {key}
              </span>
            </div>
            <ChevronDownIcon className="size-5 fill-white/60 group-data-[hover]:fill-white/50 group-data-[open]:rotate-180" />
          </DisclosureButton>
          <DisclosurePanel className="mt-2 text-sm/5 text-white/50">
            <ul>
              {steps[key].map((result, resultIndex) => (
                <li key={resultIndex} className="flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  <a
                    href={result.url}
                    className="text-sm font-medium text-white hover:text-white/80"
                  >
                    {result.title}
                  </a>
                </li>
              ))}
            </ul>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </div>
  );
};

export default Step;
