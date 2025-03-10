import z from 'zod';
import { Tool } from '@interface';

const StringCounterSchema = z.object({
  text: z.string().describe('분석할 전체 텍스트'),
  searchString: z.string().describe('찾을 문자열 (단일 문자, 단어, 또는 문장)'),
});

export const stupidStringCounter: Tool<z.infer<typeof StringCounterSchema>, { count: number; positions: number[] }> = {
  name: 'StringCounter',
  description: '텍스트에서 특정 문자열(단일 문자, 단어, 또는 문장)이 포함된 횟수와 위치를 분석합니다.',
  schema: StringCounterSchema,
  execute: ({ text, searchString }) => {
    const positions: number[] = [];
    let count = 0;
    let pos = 0;

    // 빈 문자열 검색 방지
    if (searchString.length === 0) {
      return { count: 0, positions: [] };
    }

    // 대소문자 구분 없이 모든 일치 항목 찾기
    const textLower = text.toLowerCase();
    const searchLower = searchString.toLowerCase();

    while ((pos = textLower.indexOf(searchLower, pos)) !== -1) {
      count++;
      positions.push(pos + 1); // 1부터 시작하는 위치
      pos += 1; // 다음 글자부터 검색 재개
    }

    return {
      count,
      positions,
    };
  },
};
