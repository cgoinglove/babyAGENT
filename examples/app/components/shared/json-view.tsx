'use client';

// import 'github-markdown-css';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';

// 동적으로 ReactJson 임포트 (서버에서는 로드하지 않음)
const ReactJson = dynamic(() => import('react-json-view'), {
  ssr: false,
  loading: () => <div className="p-4 animate-pulse">Loading JSON viewer...</div>,
});

export default function JsonView({ data }: { data: any }) {
  // First, determine if data is already a parsed object/array or a string
  const { parsedData, isJsonObject, displayText } = useMemo(() => {
    // If data is already an object (not a string), no need to parse
    if (data !== null && typeof data === 'object') {
      return {
        parsedData: data,
        isJsonObject: true,
        displayText: JSON.stringify(data, null, 2),
      };
    }

    // Convert to string if it's not already
    const textContent = (typeof data === 'string' ? data : String(data || '')) || 'undefined';

    // Clean the string (handle escaped characters)
    const cleanedText = textContent.trim().replaceAll('\\n', '\n').replaceAll('\\"', '"');

    // Try to parse as JSON
    try {
      // More sophisticated check for JSON-like string
      const trimmed = cleanedText.trim();
      const looksLikeJson =
        (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'));

      if (looksLikeJson) {
        const parsed = JSON.parse(trimmed);
        return {
          parsedData: parsed,
          isJsonObject: true,
          displayText: cleanedText,
        };
      } else {
        // Not JSON-like, treat as text
        return {
          parsedData: null,
          isJsonObject: false,
          displayText: cleanedText,
        };
      }
    } catch (e) {
      // If parsing fails, it's not valid JSON
      return {
        parsedData: null,
        isJsonObject: false,
        displayText: cleanedText,
      };
    }
  }, [data]);

  if (isJsonObject && parsedData) {
    try {
      return <ReactJson src={parsedData} collapsed={2} enableClipboard={false} displayDataTypes={false} />;
    } catch (e) {
      // Fallback if ReactJson fails
      return <pre className="whitespace-pre-wrap overflow-auto">{displayText}</pre>;
    }
  } else {
    return (
      <div className="w-full prose prose-pre:bg-hover-color prose-pre:text-default-text prose-pre:ring prose-pre:ring-sub-text max-w-full">
        <Markdown remarkPlugins={[remarkGfm]}>{displayText}</Markdown>
      </div>
    );
  }
}
