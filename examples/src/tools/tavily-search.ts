import { ToolCall } from '@interface';
import { z } from 'zod';
import { tavily } from '@tavily/core';

export const TavilySearchSchema = z.object({
  query: z
    .string()
    .describe(
      '검색에 최적화된 키워드 형태로 변환. 예: "오늘날씨가뭐야?" → "오늘날씨", "BTS 멤버 몇명이야?" → "BTS 멤버 수"'
    ),
});

export const tavilySearch: ToolCall<
  z.infer<typeof TavilySearchSchema>,
  Promise<{
    answer: string;
    results: {
      title: string;
      content: string;
      url: string;
      score: number;
    }[];
  }>
> = {
  name: 'RealSearchEngine',
  description: '실제 검색 엔진을 사용하여 웹 검색을 수행합니다. 정확한 답변을 위해 사용 됩니다.',
  schema: TavilySearchSchema,
  execute: async ({ query }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error('검색을 위한 TAVILY_API_KEY 가 설정되지 않았습니다.');
    const client = tavily({ apiKey });
    const result = await client.search(query, {
      searchDepth: 'advanced',
      maxResults: 3,
      includeAnswer: true,
    });
    return {
      answer: result.answer!,
      results: result.results.map((result) => ({
        title: result.title,
        content: result.content,
        url: result.url,
        score: result.score,
      })),
    };
  },
};
