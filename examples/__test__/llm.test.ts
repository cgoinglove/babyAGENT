import { suite, test } from 'vitest';
import { models } from '@examples/models';
import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod';
import { lc } from '@examples/prompts/llm-context';

suite('llm', () => {
  // only 하니씩 하면서 실행
  test('string -> string', async () => {
    const response = await generateText({
      model: models.stupid,
      prompt: '안녕하세요',
    });

    // llm 이 모든 문자열을 한번에 출력
    const result = response.text;
    console.log(result);
  });

  test('string -> string chat bot 과 같은 상태로 사용', async () => {
    /**
     *
     * ❌ Fail Case step-1
     *
     * @desc 나의 이름을 알려줌
     */
    const response = await generateText({
      model: models.stupid,
      prompt: '나의 이름은 "Park" 입니다.',
    });
    const result = response.text;
    console.log(result);
    console.log(`reponse-token: ${response.usage.totalTokens}`);

    /**
     * ❌ Fail Case step-2
     *
     * @desc 내 이름을 물어봄
     */
    const response2 = await generateText({
      model: models.stupid,
      prompt: '내 이름이 뭐라고?',
    });
    const result2 = response2.text;
    //대화 컨텍스트가 이어지지 않았기 때문에 알수 없다는 응답
    console.log(result2);
    console.log(`reponse2-token: ${response2.usage.totalTokens}`);

    /**
     * ✅ Success Case
     *
     * @desc 이전 대화내용을 추가하여 대화 컨텍스트를 이어감
     */
    const response3 = await generateText({
      model: models.stupid,
      messages: [
        {
          role: 'user',
          content: '나의 이름은 "Park" 입니다.',
        },
        {
          role: 'assistant',
          content: '안녕하세요, Park님! 만나서 반갑습니다. 무엇을 도와드릴까요?',
        },
        {
          role: 'user',
          content: '내 이름이 뭐라고?',
        },
      ],
    });

    const result3 = await response3.text;
    // 내 이름을 알고있음
    console.log(result3);
    // 더 많은 토큰을 사용하게 됨
    console.log(`reponse3-token: ${response3.usage.totalTokens}`);
  });

  test('string -> string stream', async () => {
    const response = streamText({
      model: models.stupid,
      prompt: '안녕하세요',
    });

    for await (const chunk of response.textStream) {
      // 문자열 조각을 하나씩 출력
      console.log(chunk);
    }

    // 모든 문자열 조각을 하나의 문자열로 결합
    const result = await response.text;
    console.log(result);
  });

  test('string -> json ', async () => {
    // JSON 형식으로 출력하는 모델

    // type schema = {name:string, age:number}
    const personSchema = z.object({
      name: z.string().describe('이름을 입력해주세요'),
      age: z.number().describe('나이를 입력해주세요'),
    });

    type Person = z.infer<typeof personSchema>;

    const person: Person = {
      name: 'John',
      age: 20,
    };

    const response = await generateObject({
      model: models.stupid,
      schema: personSchema,
      prompt: `나의 이름은 ${person.name}이고 나는 ${person.age}살입니다.`,
    });

    const result = await response.object;
    console.log(result);

    /**
     * schema 는 실제로 llm 에게 전달될때 사용한다
     *
     * 예를들어 유저 질문 : `나의 이름은 Jhon 이고 나는 20 살입니다.`
     *
     * 인 경우에 실제로
     *
     * const prompt = `
     *       유저 질문 : 나의 이름은 Jhon 이고 나는 20 살입니다.
     *
     *       {name:'string', age:'number'} 형식으로 출력해주세요.`
     *
     *
     * const response = llm(prompt); // string -> string
     *
     * // 문자열이지만 JSON 형식으로 출력된다.
     * console.log(response) ; // "{\"name\":\"Jhon\",\"age\":20}"
     *
     * const result =  JSON.parse(response); // JSON 형식으로 파싱
     *
     * return result; // {name:'Jhon', age:20}
     *
     * 이런 형태로 구성 되어있다고 생각하면 된다 .
     *
     */
  });

  test('string -> json -> ToolCall', async () => {
    // llm 이 툴 호출을 하는 경우

    const numberSchema = z.object({
      a: z.number().describe('첫번째 숫자를 입력해주세요'),
      b: z.number().describe('두번째 숫자를 입력해주세요'),
    });

    const response = await generateObject({
      model: models.stupid,
      schema: numberSchema,
      prompt: `100 + 200 을 계산 하려고합니다. a와 b에 숫자를 입력해주세요.`,
    });

    const object = await response.object; // {a:100, b:200}
    console.log(object);

    const sum = (a: number, b: number) => a + b;

    // llm 의 응답으로 함수 호출
    const result = sum(object.a, object.b);
    console.log(result);
  });

  test.only('llm-context', async () => {
    // 새로운 대화 컨텍스트 생성
    // 첫 번째 메시지 설정
    let context = lc({ prompt: '나의 이름은 "Park" 입니다.' });

    console.log(`STEP-1`);
    console.log(context.asMessages());
    console.log(`\n\n`);

    // LLM 호출
    const response1 = await generateText({
      model: models.stupid,
      messages: context.asMessages(),
    });

    // 응답 저장
    const answer1 = await response1.text;
    context.update({ answer: answer1, tokenUsage: response1.usage.totalTokens });
    console.log(`STEP-2`);
    console.log(context.asMessages());
    console.log(`\n\n`);

    // 대화 이어가기
    context = context.continueWith('내 이름이 뭐라고?');
    console.log(`STEP-3`);
    console.log(context.asMessages());
    console.log(`\n\n`);

    // 두 번째 LLM 호출
    const response2 = await generateText({
      model: models.stupid,
      messages: context.asMessages(),
    });

    // 두 번째 응답 확인
    const answer2 = await response2.text;
    context.update({ answer: answer2, tokenUsage: response2.usage.totalTokens });
    console.log(`STEP-4`);
    console.log(context.asMessages());
    console.log(`\n\n`);
  });
});
