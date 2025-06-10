
import React from 'react';
import { MobileOptimizedCard } from '@/components/mobile/MobileOptimizedCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentButton } from './PaymentButton';
import { Check } from 'lucide-react';

const subscriptionPlans = [
  {
    name: 'Basic Plan',
    price: 299,
    duration: 'month',
    features: [
      'Access to basic study materials',
      'MCQ practice tests',
      'Basic study timer',
      'Community forum access'
    ],
    description: 'Perfect for getting started with CA preparation'
  },
  {
    name: 'Premium Plan',
    price: 799,
    duration: 'month',
    features: [
      'All Basic Plan features',
      'Advanced study materials',
      'Unlimited MCQ tests',
      'Study rooms with voice chat',
      'Progress analytics',
      'Priority support'
    ],
    description: 'Complete CA preparation solution',
    popular: true
  },
  {
    name: 'Enterprise Plan',
    price: 1499,
    duration: 'month',
    features: [
      'All Premium Plan features',
      'Personal mentor sessions',
      'Custom study plans',
      'Advanced analytics',
      'Exam simulation tests',
      'Priority doubt clearing'
    ],
    description: 'For serious CA aspirants'
  }
];

export const SubscriptionPlans: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground">Select the perfect plan for your CA preparation journey</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {subscriptionPlans.map((plan, index) => (
          <MobileOptimizedCard key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                <span className="text-muted-foreground">/{plan.duration}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <PaymentButton
                amount={plan.price}
                itemName={`${plan.name} Subscription`}
                description={`Monthly subscription for ${plan.name}`}
                type="subscription"
                className="w-full"
              >
                Subscribe to {plan.name}
              </PaymentButton>
            </CardContent>
          </MobileOptimizedCard>
        ))}
      </div>
    </div>
  );
};
