
import React from 'react';
import { MobileOptimizedButton } from '@/components/mobile/MobileOptimizedButton';
import { useRazorpay } from '@/hooks/useRazorpay';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  amount: number;
  itemName: string;
  description: string;
  type: 'one-time' | 'subscription';
  className?: string;
  children?: React.ReactNode;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  itemName,
  description,
  type,
  className,
  children
}) => {
  const { initiatePayment, loading } = useRazorpay();

  const handlePayment = () => {
    initiatePayment({
      amount,
      currency: 'INR',
      name: itemName,
      description,
      type,
      itemName
    });
  };

  return (
    <MobileOptimizedButton
      onClick={handlePayment}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          {children || `Pay ₹${amount}`}
        </>
      )}
    </MobileOptimizedButton>
  );
};
