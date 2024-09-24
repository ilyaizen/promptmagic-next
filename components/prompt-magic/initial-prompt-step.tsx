'use client';

import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

interface InitialPromptStepProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export function InitialPromptStep({ prompt, setPrompt }: InitialPromptStepProps) {
  const { toast } = useToast();
  const {
    suggestion,
    isCompleting,
    getSuggestion,
    clearSuggestion,
    handleKeyDown,
    textareaRef,
    suggestionOverlayRef,
    updateSuggestionPosition,
  } = useAutocomplete();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    getSuggestion(newValue, e.target.selectionStart);
  };

  useEffect(() => {
    updateSuggestionPosition();
  }, [prompt, suggestion, updateSuggestionPosition]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        toast({
          title: 'Copied to clipboard',
          description: 'The initial prompt has been copied to your clipboard.',
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
              setPrompt(prompt + suggestion);
              clearSuggestion();
            }
          }}
          className="h-full resize-none"
        />
        <div ref={suggestionOverlayRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
        {isCompleting && (
          <div className="absolute bottom-2 right-2 rounded bg-muted px-2 py-1 text-sm text-muted-foreground">
            Thinking...
          </div>
        )}
        <Button variant="outline" size="sm" className="absolute bottom-2 left-2" onClick={copyToClipboard}>
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
      </div>
    </div>
  );
}
