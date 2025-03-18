import { suite, test } from 'vitest';
import { models } from '@examples/models';
import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod';

suite('llm', () => {
  // only 하니씩 하면서 실행
  test('string -> string', async () => {
    const response = await generateText({
      model: models.custom.basic,
      prompt: '안녕하세요',
    });

    // llm 이 모든 문자열을 한번에 출력
    const result = await response.text;
    console.log(result);
  });

  test('string -> string stream', async () => {
    const response = streamText({
      model: models.custom.basic,
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

  test('string -> json', async () => {
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
      model: models.custom.basic,
      schema: personSchema,
      prompt: `나의 이름은 ${person.name}이고 나는 ${person.age}살입니다.`,
    });

    const result = await response.object;
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
      model: models.custom.basic,
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
     * 이런 형태로 사용된다.
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
      model: models.custom.basic,
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
});
