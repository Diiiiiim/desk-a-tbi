import { useRef, useState } from 'react';
export function useComposition() {
  const [isComposing, setIsComposing] = useState(false);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  return {
    isComposing,
    onCompositionStart: () => setIsComposing(true),
    onCompositionEnd: () => setIsComposing(false),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (isComposing && e.key === 'Enter') e.preventDefault();
    },
    ref,
  };
}
