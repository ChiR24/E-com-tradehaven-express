import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "In which city were you born?",
  "What was your childhood nickname?",
  "What was the name of your first school?",
  "What is your mother's maiden name?",
  "What was the make of your first car?",
  "What is the name of the street you grew up on?",
  "What was your favorite subject in school?",
  "What is the name of your favorite childhood teacher?",
  "What is your favorite book from childhood?",
] as const;

interface SecurityQuestion {
  question: typeof SECURITY_QUESTIONS[number];
  answer: string;
}

interface SecurityQuestionsState {
  questions: SecurityQuestion[];
  isSetup: boolean;
}

export function useSecurityQuestions() {
  const [state, setState] = useState<SecurityQuestionsState>({
    questions: [],
    isSetup: false,
  });
  const [loading, setLoading] = useState(false);

  const setupSecurityQuestions = useCallback(async (questions: SecurityQuestion[]) => {
    if (questions.length < 3) {
      throw new Error('Please set up at least 3 security questions');
    }

    setLoading(true);
    try {
      // Hash answers before storing
      const hashedQuestions = questions.map(q => ({
        question: q.question,
        answer: hashAnswer(q.answer),
      }));

      const { error } = await supabase
        .from('security_questions')
        .upsert(hashedQuestions);

      if (error) throw error;

      setState({
        questions: hashedQuestions,
        isSetup: true,
      });

      toast.success('Security questions set up successfully');
    } catch (error) {
      toast.error('Failed to set up security questions');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifySecurityQuestions = useCallback(async (answers: SecurityQuestion[]) => {
    setLoading(true);
    try {
      const correctAnswers = await Promise.all(
        answers.map(async (answer) => {
          const { data, error } = await supabase
            .from('security_questions')
            .select('answer')
            .eq('question', answer.question)
            .single();

          if (error) throw error;
          return data.answer === hashAnswer(answer.answer);
        })
      );

      return correctAnswers.every(Boolean);
    } catch (error) {
      toast.error('Failed to verify security questions');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSecurityQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_questions')
        .select('question');

      if (error) throw error;

      setState({
        questions: data.map(q => ({ question: q.question, answer: '' })),
        isSetup: data.length > 0,
      });
    } catch (error) {
      toast.error('Failed to load security questions');
    } finally {
      setLoading(false);
    }
  }, []);

  const hashAnswer = (answer: string) => {
    // Normalize answer: lowercase, trim, remove extra spaces
    const normalized = answer.toLowerCase().trim().replace(/\s+/g, ' ');
    // In a real app, use a proper crypto hash function
    return btoa(normalized);
  };

  return {
    ...state,
    loading,
    setupSecurityQuestions,
    verifySecurityQuestions,
    loadSecurityQuestions,
    availableQuestions: SECURITY_QUESTIONS,
  };
} 