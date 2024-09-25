'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2, WandSparkles } from 'lucide-react';
import Link from 'next/link';
import { InitialPromptStep } from '@/components/prompt-magic/initial-prompt-step';
import { RefinePromptStep } from '@/components/prompt-magic/refine-prompt-step';
import { FeedbackStep } from '@/components/prompt-magic/feedback-step';
import { ExportStep } from '@/components/prompt-magic/export-step';

const steps = ['Initial Prompt', 'Refine Prompt', 'Feedback', 'Export'];

export function PromptMagic() {
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cachedPrompt, setCachedPrompt] = useState('');

  const refinePrompt = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, action: 'refine' }),
      });
      if (!response.ok) {
        throw new Error(`Failed to refine prompt: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.refinedContent) {
        setRefinedPrompt(data.refinedContent);
        setCachedPrompt(prompt);
      } else {
        console.error('Refined content is missing from the response');
      }
    } catch (error) {
      console.error('Error refining prompt:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleNext = async () => {
    if (currentStep === 0) {
      if (prompt !== cachedPrompt) {
        await refinePrompt();
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleIterate = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
    setCurrentStep(0);
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <InitialPromptStep prompt={prompt} setPrompt={setPrompt} />;
      case 1:
        return (
          <RefinePromptStep
            refinedPrompt={refinedPrompt}
            setRefinedPrompt={setRefinedPrompt}
            onIterate={handleIterate}
          />
        );
      case 2:
        return <FeedbackStep feedback={feedback} setFeedback={setFeedback} />;
      case 3:
        return <ExportStep refinedPrompt={refinedPrompt} prompt={prompt} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="flex h-[calc(100vh-2rem)] w-full max-w-7xl flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>
            <Link href="/" className="flex items-center space-x-2">
              <div className="rounded-full bg-primary p-1">
                <WandSparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PromptMagic v2024-09-24</span>
            </Link>
          </CardTitle>
          <CardDescription>
            Create and refine your AI prompts.
            <br />
            This project is a Work in Progress; check it out on{' '}
            <Link href="https://github.com/ilyaizen/promptmagic-next" className="text-primary hover:underline">
              GitHub
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-grow flex-col overflow-hidden">
          <div className="mb-4 flex-shrink-0">
            <div className="mb-2 flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`text-sm font-medium ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex-grow overflow-hidden">{renderStep()}</div>
        </CardContent>
        <CardFooter className="flex flex-shrink-0 justify-between">
          <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1 || isLoading || (currentStep === 0 && !prompt)}
            className="relative"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
