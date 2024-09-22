'use client';

import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

interface ExportStepProps {
  refinedPrompt: string;
  prompt: string;
}

export function ExportStep({ refinedPrompt, prompt }: ExportStepProps) {
  const handleExport = () => {
    const exportData = {
      initialPrompt: prompt,
      refinedPrompt: refinedPrompt,
    };
    const dataStr = JSON.stringify(exportData);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'prompt-magic-export.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <h3 className="mb-2 font-semibold">Final Prompt:</h3>
            <pre className="whitespace-pre-wrap">{refinedPrompt || prompt}</pre>
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
}
