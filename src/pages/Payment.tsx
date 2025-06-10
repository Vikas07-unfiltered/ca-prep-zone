
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionPlans } from '@/components/payment/SubscriptionPlans';
import { ClassesAndTools } from '@/components/payment/ClassesAndTools';
import { ScrollReveal } from '@/components/ScrollReveal';

const Payment: React.FC = () => {
  return (
    <div className="container py-8 md:py-12">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Payment & Subscriptions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our flexible payment options to enhance your CA preparation journey
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="classes-tools">Classes & Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscriptions">
            <SubscriptionPlans />
          </TabsContent>
          
          <TabsContent value="classes-tools">
            <ClassesAndTools />
          </TabsContent>
        </Tabs>
      </ScrollReveal>
    </div>
  );
};

export default Payment;
