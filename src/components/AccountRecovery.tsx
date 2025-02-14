import { useState } from 'react';
import { useRecoveryCodes } from '@/hooks/useRecoveryCodes';
import { useSecurityQuestions } from '@/hooks/useSecurityQuestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface AccountRecoveryProps {
  onSuccess: () => void;
  onCancel: () => void;
  email: string;
}

type RecoveryMethod = 'code' | 'questions' | 'select';

export function AccountRecovery({ onSuccess, onCancel, email }: AccountRecoveryProps) {
  const [method, setMethod] = useState<RecoveryMethod>('select');
  const [loading, setLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const { verifyRecoveryCode } = useRecoveryCodes();
  const { questions, verifySecurityQuestions, loadSecurityQuestions } = useSecurityQuestions();

  const handleMethodSelect = async (method: RecoveryMethod) => {
    setMethod(method);
    if (method === 'questions') {
      await loadSecurityQuestions();
    }
  };

  const handleRecoveryCode = async () => {
    setLoading(true);
    try {
      const isValid = await verifyRecoveryCode(recoveryCode);
      if (isValid) {
        toast.success('Recovery code verified successfully');
        onSuccess();
      } else {
        toast.error('Invalid recovery code');
      }
    } catch (error) {
      toast.error('Failed to verify recovery code');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestions = async () => {
    setLoading(true);
    try {
      const questionsWithAnswers = questions.map(q => ({
        question: q.question,
        answer: answers[q.question] || '',
      }));

      const isValid = await verifySecurityQuestions(questionsWithAnswers);
      if (isValid) {
        toast.success('Security questions verified successfully');
        onSuccess();
      } else {
        toast.error('Incorrect answers');
      }
    } catch (error) {
      toast.error('Failed to verify answers');
    } finally {
      setLoading(false);
    }
  };

  if (method === 'select') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Account Recovery</h3>
          <p className="text-sm text-gray-500">
            Select a method to recover your account
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => handleMethodSelect('code')}
            className="w-full"
            variant="outline"
          >
            Use Recovery Code
          </Button>
          <Button
            onClick={() => handleMethodSelect('questions')}
            className="w-full"
            variant="outline"
          >
            Answer Security Questions
          </Button>
          <Button
            onClick={onCancel}
            className="w-full"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (method === 'code') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Enter Recovery Code</h3>
          <p className="text-sm text-gray-500">
            Enter one of your backup recovery codes
          </p>
        </div>

        <div className="space-y-4">
          <Input
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX-XXXX"
            className="text-center tracking-widest"
            maxLength={14}
            autoFocus
          />

          <div className="space-y-2">
            <Button
              onClick={handleRecoveryCode}
              className="w-full"
              disabled={loading || recoveryCode.length < 14}
            >
              Verify Code
            </Button>
            <Button
              onClick={() => setMethod('select')}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (method === 'questions') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Security Questions</h3>
          <p className="text-sm text-gray-500">
            Answer your security questions to recover your account
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.question} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {q.question}
              </label>
              <Input
                value={answers[q.question] || ''}
                onChange={(e) => setAnswers(prev => ({
                  ...prev,
                  [q.question]: e.target.value,
                }))}
                placeholder="Your answer"
              />
            </div>
          ))}

          <div className="space-y-2">
            <Button
              onClick={handleSecurityQuestions}
              className="w-full"
              disabled={loading || Object.keys(answers).length < questions.length}
            >
              Verify Answers
            </Button>
            <Button
              onClick={() => setMethod('select')}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 