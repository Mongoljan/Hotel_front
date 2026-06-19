'use client';

import { useCallback, useEffect, useState } from 'react';
import { IconMessageQuestion, IconPencil } from '@tabler/icons-react';
import { HelpCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getClientBackendToken } from '@/utils/auth';

const FAQ_QUESTIONS_API = 'https://dev.kacc.mn/api/faq-questions/';

interface FaqQuestion {
  id: number;
  question_mn: string;
  question_en: string;
  order: number;
}

interface PropertyFaq {
  id: number;
  property: number;
  question: number;
  question_mn: string;
  question_en: string;
  answer_mn: string;
  answer_en: string;
  updated_at: string;
}

interface FaqManagerProps {
  propertyId: number | null;
}

interface DraftAnswer {
  answer_mn: string;
  answer_en: string;
}

function getDisplayAnswer(faq: PropertyFaq | undefined, locale: string): string {
  if (!faq) return '';
  const mn = faq.answer_mn?.trim() || '';
  const en = faq.answer_en?.trim() || '';
  if (locale === 'en') return en || mn;
  return mn || en;
}

export function FaqManager({ propertyId }: FaqManagerProps) {
  const t = useTranslations('SixStepInfo');
  const locale = useLocale();

  const [questions, setQuestions] = useState<FaqQuestion[]>([]);
  const [faqsByQuestion, setFaqsByQuestion] = useState<Record<number, PropertyFaq>>({});
  const [drafts, setDrafts] = useState<Record<number, DraftAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const token = await getClientBackendToken();
      if (!token) {
        toast.error(t('faqLoadError'));
        return;
      }

      const propertyFaqsUrl = `/api/property-faqs?property=${propertyId}&token=${encodeURIComponent(token)}`;

      const [questionsRes, faqsRes] = await Promise.all([
        fetch(FAQ_QUESTIONS_API, { cache: 'no-store' }),
        fetch(propertyFaqsUrl, { cache: 'no-store' }),
      ]);

      const questionsData: FaqQuestion[] = await questionsRes.json();
      const faqsData = await faqsRes.json();
      const faqs: PropertyFaq[] = Array.isArray(faqsData?.faqs) ? faqsData.faqs : [];

      const sortedQuestions = Array.isArray(questionsData)
        ? [...questionsData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [];

      const byQuestion: Record<number, PropertyFaq> = {};
      faqs.forEach((f) => {
        byQuestion[f.question] = f;
      });

      const initialDrafts: Record<number, DraftAnswer> = {};
      sortedQuestions.forEach((q) => {
        initialDrafts[q.id] = {
          answer_mn: byQuestion[q.id]?.answer_mn || '',
          answer_en: byQuestion[q.id]?.answer_en || '',
        };
      });

      setQuestions(sortedQuestions);
      setFaqsByQuestion(byQuestion);
      setDrafts(initialDrafts);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
      toast.error(t('faqLoadError'));
    } finally {
      setLoading(false);
    }
  }, [propertyId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDraftChange = (questionId: number, field: keyof DraftAnswer, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value },
    }));
  };

  const handleStartEdit = (questionId: number) => {
    const faq = faqsByQuestion[questionId];
    setDrafts((prev) => ({
      ...prev,
      [questionId]: {
        answer_mn: faq?.answer_mn || prev[questionId]?.answer_mn || '',
        answer_en: faq?.answer_en || prev[questionId]?.answer_en || '',
      },
    }));
    setEditingId(questionId);
  };

  const handleCancelEdit = (questionId: number) => {
    const faq = faqsByQuestion[questionId];
    setDrafts((prev) => ({
      ...prev,
      [questionId]: {
        answer_mn: faq?.answer_mn || '',
        answer_en: faq?.answer_en || '',
      },
    }));
    setEditingId(null);
  };

  const handleSave = async (questionId: number) => {
    const draft = drafts[questionId];
    if (!draft || (!draft.answer_mn.trim() && !draft.answer_en.trim())) {
      toast.error(t('faqAnswerRequired'));
      return;
    }
    if (!propertyId) return;

    try {
      setSavingId(questionId);
      const token = await getClientBackendToken();
      if (!token) {
        toast.error(t('faqSaveError'));
        return;
      }

      const res = await fetch(
        `/api/property-faqs?property=${propertyId}&token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property: propertyId,
            question: questionId,
            answer_mn: draft.answer_mn,
            answer_en: draft.answer_en,
          }),
        }
      );
      if (!res.ok) throw new Error(t('faqSaveError'));
      toast.success(t('faqSaveSuccess'));
      setEditingId(null);
      await loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('faqSaveError'));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (questionId: number) => {
    const faq = faqsByQuestion[questionId];
    if (!faq) return;
    try {
      setDeletingId(questionId);
      const token = await getClientBackendToken();
      if (!token) {
        toast.error(t('faqDeleteError'));
        return;
      }

      const res = await fetch(
        `/api/property-faqs/${faq.id}?token=${encodeURIComponent(token)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error(t('faqDeleteError'));
      toast.success(t('faqDeleteSuccess'));
      setEditingId(null);
      await loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('faqDeleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  const answeredCount = questions.filter((q) => {
    const faq = faqsByQuestion[q.id];
    return !!(faq?.answer_mn?.trim() || faq?.answer_en?.trim());
  }).length;
  const totalCount = questions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between gap-4">
        <h3 className="text-[16px] font-semibold leading-snug">
          {t('faqSectionTitle')} ({answeredCount}/{totalCount})
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                aria-label={t('faqHelpTitle')}
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="end" className="max-w-[300px] px-4 py-3">
              <p className="font-semibold text-sm leading-snug">{t('faqHelpTitle')}</p>
              <p className="mt-1.5 text-sm leading-relaxed opacity-90">{t('faqHelpDescription')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-6">
          <IconMessageQuestion className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">{t('faqNoQuestions')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, index) => {
            const faq = faqsByQuestion[q.id];
            const answered = !!faq && !!(faq.answer_mn?.trim() || faq.answer_en?.trim());
            const isEditing = editingId === q.id;
            const draft = drafts[q.id] || { answer_mn: '', answer_en: '' };
            const displayAnswer = getDisplayAnswer(faq, locale);
            const questionText = locale === 'en' ? q.question_en : q.question_mn;

            return (
              <div key={q.id} className="rounded-lg border bg-card px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[14px] font-semibold text-foreground leading-snug">
                    {index + 1}. {questionText}
                  </p>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleStartEdit(q.id)}
                      aria-label={t('editDisabled')}
                    >
                      <IconPencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{t('faqAnswerMn')}</Label>
                        <Textarea
                          value={draft.answer_mn}
                          onChange={(e) => handleDraftChange(q.id, 'answer_mn', e.target.value)}
                          placeholder={t('faqAnswerMnPlaceholder')}
                          className="min-h-[80px] resize-none bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{t('faqAnswerEn')}</Label>
                        <Textarea
                          value={draft.answer_en}
                          onChange={(e) => handleDraftChange(q.id, 'answer_en', e.target.value)}
                          placeholder={t('faqAnswerEnPlaceholder')}
                          className="min-h-[80px] resize-none bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      {answered && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(q.id)}
                          disabled={deletingId === q.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {deletingId === q.id ? t('saving') : t('faqDelete')}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleCancelEdit(q.id)}>
                        {t('cancel')}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSave(q.id)}
                        disabled={savingId === q.id}
                      >
                        {savingId === q.id ? t('saving') : t('save')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Separator className="my-3" />
                    <p
                      className={
                        answered
                          ? 'text-[16px] text-foreground leading-relaxed'
                          : 'text-[16px] text-muted-foreground leading-relaxed'
                      }
                    >
                      {answered ? displayAnswer : t('faqNoAnswer')}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
