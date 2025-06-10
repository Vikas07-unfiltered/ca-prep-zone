
import React from 'react';
import { MobileOptimizedCard } from '@/components/mobile/MobileOptimizedCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentButton } from './PaymentButton';
import { BookOpen, Timer, Users, Calculator } from 'lucide-react';

const classesAndTools = [
  {
    type: 'class',
    name: 'Advanced Accounting Class',
    price: 499,
    description: 'Comprehensive accounting course with expert guidance',
    icon: BookOpen,
    duration: '8 weeks',
    features: ['Live classes', 'Recorded sessions', 'Study materials', 'Doubt clearing']
  },
  {
    type: 'class',
    name: 'Taxation Masterclass',
    price: 699,
    description: 'Complete taxation course for CA preparation',
    icon: Calculator,
    duration: '10 weeks',
    features: ['Expert faculty', 'Case studies', 'Practice tests', 'Certificate']
  },
  {
    type: 'tool',
    name: 'Premium Study Timer',
    price: 99,
    description: 'Advanced Pomodoro timer with analytics',
    icon: Timer,
    duration: 'Lifetime',
    features: ['Custom intervals', 'Progress tracking', 'Analytics', 'No ads']
  },
  {
    type: 'tool',
    name: 'Study Room Pro',
    price: 149,
    description: 'Premium study rooms with advanced features',
    icon: Users,
    duration: '1 year',
    features: ['Private rooms', 'Screen sharing', 'Whiteboard', 'Recording']
  }
];

export const ClassesAndTools: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Classes & Tools</h2>
        <p className="text-muted-foreground">Enhance your CA preparation with our premium classes and tools</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classesAndTools.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <MobileOptimizedCard key={index}>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                  <div className="text-sm text-muted-foreground">{item.duration}</div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {item.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-muted-foreground">
                      • {feature}
                    </li>
                  ))}
                </ul>
                
                <PaymentButton
                  amount={item.price}
                  itemName={item.name}
                  description={`Purchase ${item.name}`}
                  type="one-time"
                  className="w-full"
                >
                  Buy Now
                </PaymentButton>
              </CardContent>
            </MobileOptimizedCard>
          );
        })}
      </div>
    </div>
  );
};
