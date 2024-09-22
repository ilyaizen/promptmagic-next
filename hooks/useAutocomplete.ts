import { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

interface AutocompleteResult {
  suggestion: string;
  isCompleting: boolean;
}

export function useAutocomplete() {
  const [result, setResult] = useState<AutocompleteResult>({
    suggestion: '',
    isCompleting: false,
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const [lastKeyWasBackspace, setLastKeyWasBackspace] = useState(false);

  const getSuggestion = useCallback(
    debounce(async (text: string, cursorPosition: number) => {
      // Check if the cursor is at the end of the text and after a space
      // Also check if the last key pressed was not backspace
      if (text.length < 5 || cursorPosition !== text.length || !text.endsWith(' ') || lastKeyWasBackspace) {
        setResult((prev) => ({ ...prev, suggestion: '' }));
        return;
      }

      setResult((prev) => ({ ...prev, isCompleting: true }));
      try {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, action: 'complete' }),
          signal: abortControllerRef.current.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to get suggestion');
        }
        const data = await response.json();
        // Trim leading quote from the suggestion
        const trimmedSuggestion = data.suggestion.replace(/^["']/, '');
        setResult((prev) => ({ ...prev, suggestion: trimmedSuggestion }));
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error getting suggestion:', error);
        }
      } finally {
        setResult((prev) => ({ ...prev, isCompleting: false }));
      }
    }, 300),
    [lastKeyWasBackspace]
  );

  const clearSuggestion = useCallback(() => {
    setResult({ suggestion: '', isCompleting: false });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Backspace') {
        setLastKeyWasBackspace(true);
        clearSuggestion();
      } else {
        setLastKeyWasBackspace(false);
      }
    },
    [clearSuggestion]
  );

  return { ...result, getSuggestion, clearSuggestion, handleKeyDown };
}
