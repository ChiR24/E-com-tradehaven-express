import React from 'react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  items: {
    title: string;
    description?: string;
    timestamp: number;
    status?: 'success' | 'warning' | 'error' | 'info';
    icon?: React.ReactNode;
  }[];
}

const statusStyles = {
  success: 'bg-success-100 text-success-700 ring-success-50',
  warning: 'bg-warning-100 text-warning-700 ring-warning-50',
  error: 'bg-error-100 text-error-700 ring-error-50',
  info: 'bg-primary-100 text-primary-700 ring-primary-50',
};

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {items.map((item, itemIdx) => (
          <li key={itemIdx}>
            <div className="relative pb-8">
              {itemIdx !== items.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full ring-8',
                      item.status ? statusStyles[item.status] : 'bg-gray-100 ring-gray-50'
                    )}
                  >
                    {item.icon || (
                      <div className="h-2.5 w-2.5 rounded-full bg-current" />
                    )}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 