import { useState, useCallback, useRef, useEffect } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const suggestionOverlayRef = useRef<HTMLDivElement | null>(null);

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

  const updateSuggestionPosition = useCallback(() => {
    if (!textareaRef.current || !suggestionOverlayRef.current) return;

    const textarea = textareaRef.current;
    const overlay = suggestionOverlayRef.current;
    const computedStyle = window.getComputedStyle(textarea);

    overlay.style.font = computedStyle.font;
    overlay.style.lineHeight = computedStyle.lineHeight;
    overlay.style.padding = computedStyle.padding;
    overlay.style.border = computedStyle.border;
    overlay.style.boxSizing = computedStyle.boxSizing;
    overlay.style.width = computedStyle.width;
    overlay.style.height = computedStyle.height;
    overlay.style.overflowY = 'auto';
    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.wordBreak = 'break-word';

    const cursorPosition = textarea.selectionStart;
    const text = textarea.value;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const textAfterCursor = text.substring(cursorPosition);

    overlay.textContent = textBeforeCursor;
    const suggestionSpan = document.createElement('span');
    suggestionSpan.textContent = result.suggestion;
    suggestionSpan.style.color = 'gray';
    overlay.appendChild(suggestionSpan);
    overlay.appendChild(document.createTextNode(textAfterCursor));

    textarea.style.color = 'transparent';
    textarea.style.caretColor = 'black';
  }, [result.suggestion]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      updateSuggestionPosition();
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('scroll', updateSuggestionPosition);
    window.addEventListener('resize', updateSuggestionPosition);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('scroll', updateSuggestionPosition);
      window.removeEventListener('resize', updateSuggestionPosition);
    };
  }, [updateSuggestionPosition]);

  return {
    ...result,
    getSuggestion,
    clearSuggestion,
    handleKeyDown,
    textareaRef,
    suggestionOverlayRef,
    updateSuggestionPosition,
  };
}
