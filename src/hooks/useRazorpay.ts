
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PaymentOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  type: 'one-time' | 'subscription';
  itemName: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const initiatePayment = async (options: PaymentOptions) => {
    if (!user) {
      toast.error('Please login to make a payment');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: {
            amount: options.amount,
            currency: options.currency,
            receipt: `rcpt_${Date.now()}`,
            type: options.type,
            itemName: options.itemName
          }
        }
      );

      if (orderError || !orderData) {
        throw new Error(orderError?.message || 'Failed to create order');
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      script.onload = () => {
        const razorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'CA Study Platform',
          description: options.description,
          order_id: orderData.orderId,
          handler: async (response: RazorpayResponse) => {
            try {
              // Verify payment
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                'verify-razorpay-payment',
                {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    type: options.type,
                    itemName: options.itemName,
                    amount: orderData.amount
                  }
                }
              );

              if (verifyError || !verifyData?.success) {
                throw new Error(verifyError?.message || 'Payment verification failed');
              }

              toast.success('Payment completed successfully!');
              console.log('Payment successful:', verifyData);
              
              // Refresh the page or redirect as needed
              window.location.reload();
              
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user.user_metadata?.full_name || '',
            email: user.email || '',
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              toast.info('Payment cancelled');
            }
          }
        };

        const razorpay = new (window as any).Razorpay(razorpayOptions);
        razorpay.open();
        setLoading(false);
      };

      script.onerror = () => {
        setLoading(false);
        toast.error('Failed to load payment gateway');
      };

    } catch (error) {
      setLoading(false);
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment');
    }
  };

  return { initiatePayment, loading };
};
