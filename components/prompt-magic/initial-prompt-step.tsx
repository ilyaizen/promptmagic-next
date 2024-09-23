'use client';

import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useAutocomplete } from '@/hooks/useAutocomplete';

interface InitialPromptStepProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export function InitialPromptStep({ prompt, setPrompt }: InitialPromptStepProps) {
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
      </div>
    </div>
  );
}
