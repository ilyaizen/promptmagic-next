'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

// Define the props interface for the RefinePromptStep component
interface RefinePromptStepProps {
  refinedPrompt: string;
  setRefinedPrompt: (prompt: string) => void;
}

export function RefinePromptStep({ refinedPrompt, setRefinedPrompt }: RefinePromptStepProps) {
  const { toast } = useToast();

  // Function to copy the entire refined prompt to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(refinedPrompt)
      .then(() => {
        // Show success toast
        toast({
          title: 'Copied to clipboard',
          description: 'The refined prompt has been copied to your clipboard.',
          action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
        });
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        // Show error toast
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
      <div className="relative flex-grow">
        <Textarea
          placeholder="Enter your prompt..."
          value={refinedPrompt}
          onChange={(e) => setRefinedPrompt(e.target.value)}
          className="h-full resize-none"
        />
      </div>
      <Button variant="outline" className="self-end" onClick={copyToClipboard}>
        <Copy className="mr-2 h-4 w-4" /> Copy All
      </Button>
    </div>
  );
}
