import { useState, useEffect, useRef } from 'react';

export function useTypewriter(text: string, speed: number = 100) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset state when text changes
    setDisplayText('');
    setIsComplete(false);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    let index = 0;

    const typeCharacter = () => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
        timeoutRef.current = setTimeout(typeCharacter, speed);
      } else {
        setIsComplete(true);
      }
    };

    // Start typing after a small delay
    timeoutRef.current = setTimeout(typeCharacter, speed);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed]);

  return { displayText, isComplete };
}

export default useTypewriter;
