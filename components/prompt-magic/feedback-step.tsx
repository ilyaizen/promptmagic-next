'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface FeedbackStepProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
}

export function FeedbackStep({ feedback, setFeedback }: FeedbackStepProps) {
  return (
    <div className="space-y-4">
      <Label htmlFor="feedback">How satisfied are you with the refined prompt?</Label>
      <RadioGroup id="feedback" value={feedback} onValueChange={setFeedback}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="very-satisfied" id="very-satisfied" />
          <Label htmlFor="very-satisfied">Very Satisfied</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="satisfied" id="satisfied" />
          <Label htmlFor="satisfied">Satisfied</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="neutral" id="neutral" />
          <Label htmlFor="neutral">Neutral</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="unsatisfied" id="unsatisfied" />
          <Label htmlFor="unsatisfied">Unsatisfied</Label>
        </div>
      </RadioGroup>
      <Textarea
        placeholder="Any additional feedback or suggestions for improvement?"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="min-h-[100px]"
      />
    </div>
  );
}
