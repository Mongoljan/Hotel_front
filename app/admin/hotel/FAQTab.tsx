'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { IconQuestionMark, IconAlertCircle } from '@tabler/icons-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  property: number;
}

interface FAQTabProps {
  hotelId: number;
}

export default function FAQTab({ hotelId }: FAQTabProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const res = await fetch(`https://dev.kacc.mn/api/faqs/?property=${hotelId}`);
        if (res.ok) {
          const data = await res.json();
          setFaqs(data);
        }
      } catch (error) {
        console.error('Error loading FAQs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQs();
  }, [hotelId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Түгээмэл асуултууд ачааллаж байна...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (faqs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyrillic">
            <IconAlertCircle className="h-5 w-5 text-muted-foreground" />
            Түгээмэл асуулт
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <IconQuestionMark className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm">Түгээмэл асуулт хараахан нэмэгдээгүй байна</p>
            <p className="text-xs mt-2">Админ хэсгээс асуулт нэмэх боломжтой</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyrillic">
            <IconQuestionMark className="h-5 w-5 text-primary" />
            Түгээмэл асуулт хариулт
          </CardTitle>
          <CardDescription>
            Зочдоос байнга асуудаг асуултууд болон тэдгээрийн хариулт
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={`faq-${faq.id}`}
                className="border rounded-lg px-4 bg-card shadow-sm"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="font-medium">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-9 pr-4 pb-4 text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
