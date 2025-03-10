import { suite, expect, test } from 'vitest';
import { models, pureLLM } from '@examples/models';
import z from 'zod';
import { generateObject } from 'ai';

suite.skip('prompt', () => {
  test('schema model from pure model', async () => {
    const llm = pureLLM(models.stupid);

    const answer = await llm(
      `
          당신은 텍스트를 정확한 JSON 형식으로 변환하는 파서입니다.

          시스템 요구사항:
          1. 아래 JSON 스키마에 맞게 응답해야 합니다.
          2. 사용자 텍스트에서 필요한 정보를 추출하여 JSON으로 변환하세요.
          3. 응답은 반드시 유효한 JSON만 포함해야 합니다.
          4. 다른 설명이나 텍스트는 추가하지 마세요.

          JSON 스키마:
              ${'{"name": string, "age": number}'}

          응답 형식:
          {
            // 추출된 JSON 여기에 입력
          }
          사용자 텍스트: "${'나의 이름은 kim 이고 18세 입니다.'}"
`
    );
    console.log(answer);
    const softJsonParser = (text: string) => {
      const regex = /```(?:json)?\s*([\s\S]*?)\s*```/;
      const match = text.match(regex);

      if (!match) {
        throw new Error('No JSON found in markdown code blocks');
      }

      return JSON.parse(match[1]);
    };
    const json = softJsonParser(answer);
    console.log(json);
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('age');
  });

  test('tool call', async () => {
    const schema = z.object({
      a: z.number(),
      b: z.number(),
      needTool: z.boolean(),
    });

    const llm = (prompt: string) =>
      generateObject({
        model: models.stupid,
        prompt,
        schema,
      }).then((res) => res.object);

    const toolPrompt = (userInput: string) => `
          당신은 도구를 호출할 수 있는 AI 도우미입니다.
          
          사용자의 질문이 '+' 수학 연산이 필요한 질문이라면 needTool을 true로 설정하세요.
          그렇지 않은 경우, needTool을 false로 설정하세요.

          사용자 입력: "${userInput}"
    `;

    const notUseToolAnswer = await llm(toolPrompt(`안녕하세요? 당신의 이름은 무엇입니까?`));

    expect(notUseToolAnswer.needTool).toBe(false);

    const useToolAnswer = await llm(
      toolPrompt(`나는 사과 6개가 있었고,마트에서 3개를 구매했습니다. 나는 총 몇개의 사과가 있나요?`)
    );
    expect(useToolAnswer.needTool).toBe(true);
    const addTool = (v: { a: number; b: number }) => v.a + v.b;

    expect(addTool(useToolAnswer)).toBeTypeOf('number');
  });

  test('chain of thout', async () => {
    const problem =
      '민수는 사과 5개를 가지고 있었습니다. 친구에게 2개를 주었고, 슈퍼마켓에서 3개를 더 샀습니다. 민수는 현재 몇 개의 사과를 가지고 있을까요?';

    // Non-COT 프롬프트 - 단순히 문제만 제시
    const nonCotPrompt = problem;

    // COT 프롬프트 - 단계별 사고 과정을 요청
    const cotPrompt = `
        다음 문제를 단계별로 생각하면서 풀어주세요. 각 단계에서의 사고 과정을 "생각:"으로 시작하여 자세히 보여주고, 
        최종 답변을 "답변:"으로 시작하여 제공해주세요.

        문제: ${problem}
`;

    const llm = pureLLM(models.stupid);
    const nonCotResult = await llm(nonCotPrompt);
    console.log(`Non-COT: ${nonCotResult}`);
    const cotResult = await llm(cotPrompt);
    console.log(`COT: ${cotResult}`);
  });
});
