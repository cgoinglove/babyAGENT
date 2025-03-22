'use client';

import { useState, useEffect } from 'react';

export default function TextStream({
  text = 'This is a streaming text component that types out characters one by one...',
  typingSpeed = 60,
  startDelay = 500,
  className = '',
}) {
  const [displayedText, setDisplayedText] = useState('');

  // Typing effect
  useEffect(() => {
    let timeout;
    let currentIndex = 0;

    // Delay before starting
    timeout = setTimeout(() => {
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.substring(0, currentIndex + 1));
          currentIndex++;
          timeout = setTimeout(typeNextChar, typingSpeed);
        }
      };

      typeNextChar();
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [text, typingSpeed, startDelay]);

  return (
    <div className={`${className}`}>
      <span>{displayedText}</span>
    </div>
  );
}
