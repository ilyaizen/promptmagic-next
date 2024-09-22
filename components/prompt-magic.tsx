'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, Download, Share2, Loader2, Copy, WandSparkles } from 'lucide-react';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const steps = ['Initial Prompt', 'Refine Prompt', 'Feedback', 'Export'];

export function PromptMagic() {
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [feedback, setFeedback] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedPrompt, setCachedPrompt] = useState('');
  const { toast } = useToast();

  const { suggestion, isCompleting, getSuggestion, clearSuggestion, handleKeyDown } = useAutocomplete();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    getSuggestion(newValue, e.target.selectionStart);
  };

  const refinePrompt = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Sending prompt for refinement:', prompt); // Debug log
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, action: 'refine' }),
      });
      if (!response.ok) {
        throw new Error(`Failed to refine prompt: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Received refined prompt data:', data); // Debug log
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

  const handleSuggestionClick = () => {
    if (suggestion) {
      setPrompt((prev) => prev + suggestion);
      clearSuggestion();
    }
  };

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

  const handleExport = () => {
    const exportData = {
      initialPrompt: prompt,
      refinedPrompt: refinedPrompt,
      feedback: feedback,
    };
    const dataStr = JSON.stringify(exportData);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'prompt-magic-export.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(refinedPrompt)
      .then(() => {
        toast({
          title: 'Copied to clipboard',
          description: 'The refined prompt has been copied to your clipboard.',
          action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
        });
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        toast({
          title: 'Failed to copy',
          description: 'An error occurred while copying to clipboard.',
          variant: 'destructive',
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex h-full flex-col">
            <div className="relative flex-grow">
              <Textarea
                ref={textareaRef}
                placeholder="Enter your initial prompt here..."
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={(e) => {
                  handleKeyDown(e);
                  if (e.key === 'Tab' && suggestion) {
                    e.preventDefault();
                    setPrompt((prev) => prev + suggestion);
                    clearSuggestion();
                  }
                }}
                className="h-full resize-none"
              />
              {suggestion && !isCompleting && (
                <div
                  className="hover:bg-muted-hover absolute bottom-2 right-2 cursor-pointer rounded bg-muted px-2 py-1 text-sm text-muted-foreground"
                  onClick={handleSuggestionClick}
                >
                  {suggestion}
                </div>
              )}
              {isCompleting && (
                <div className="absolute bottom-2 right-2 rounded bg-muted px-2 py-1 text-sm text-muted-foreground">
                  Thinking...
                </div>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex h-full flex-col">
            <div className="relative flex-grow">
              <Textarea
                ref={textareaRef}
                placeholder="Refined prompt..."
                value={refinedPrompt}
                onChange={(e) => setRefinedPrompt(e.target.value)}
                className="h-full resize-none"
              />
              <Button variant="outline" size="icon" className="absolute bottom-2 right-2" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 2:
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
      case 3:
        return (
          <div className="flex h-full flex-col">
            <div className="flex-grow overflow-y-auto">
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="mb-2 font-semibold">Final Prompt:</h3>
                  <ReactMarkdown
                    className="prose dark:prose-invert max-w-none"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {refinedPrompt || prompt}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button onClick={handleExport} className="flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export JSON</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        );
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
              <span className="text-xl font-bold">PromptMagic</span>
            </Link>
          </CardTitle>
          <CardDescription>Create and refine your AI prompts</CardDescription>
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
