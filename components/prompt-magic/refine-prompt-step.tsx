'use client';

import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';

interface RefinePromptStepProps {
  refinedPrompt: string;
  setRefinedPrompt: (prompt: string) => void;
  toast: any; // Replace 'any' with the correct type from your toast library
}

export function RefinePromptStep({ refinedPrompt, setRefinedPrompt, toast }: RefinePromptStepProps) {
  const [promptParts, setPromptParts] = useState<string[]>([]);

  useEffect(() => {
    const parts = refinedPrompt.split('---').map((part) => part.trim());
    setPromptParts(parts.length >= 3 ? parts.slice(1, 3) : [refinedPrompt]);
  }, [refinedPrompt]);

  const updatePromptPart = (index: number, value: string) => {
    const newParts = [...promptParts];
    newParts[index] = value;
    setPromptParts(newParts);
    setRefinedPrompt(
      promptParts.length > 1 ? [refinedPrompt.split('---')[0], ...newParts].join('\n---\n') : newParts[0]
    );
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

  return (
    <div className="flex h-full flex-col space-y-4">
      {promptParts.map((part, index) => (
        <div key={index} className="relative flex-grow">
          <Textarea
            placeholder={promptParts.length > 1 ? `Prompt part ${index + 2}...` : 'Enter your prompt...'}
            value={part}
            onChange={(e) => updatePromptPart(index, e.target.value)}
            className="h-full resize-none"
          />
        </div>
      ))}
      <Button variant="outline" className="self-end" onClick={copyToClipboard}>
        <Copy className="mr-2 h-4 w-4" /> Copy All
      </Button>
    </div>
  );
}
