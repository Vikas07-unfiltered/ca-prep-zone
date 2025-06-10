
import React from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps extends CardProps {
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
        "shadow-lg border-0 rounded-xl bg-white",
        "touch-manipulation select-none",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};
