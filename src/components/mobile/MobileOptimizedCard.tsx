
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <Card
      className={cn(
        "shadow-lg border-0 rounded-xl bg-white dark:bg-gray-900",
        "touch-manipulation select-none",
        "transition-all duration-200 ease-in-out",
        "hover:shadow-xl active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};
