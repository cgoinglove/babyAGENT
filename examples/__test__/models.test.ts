import { suite, expect, test } from 'vitest';
import { pureLLM, models } from '@examples/models';

suite('model', () => {
  test('pure model', async () => {
    const llm = pureLLM(models.stupid);
    const answer = await llm('hello');
    console.log(answer);
    expect(answer).toBeTypeOf('string');
  });
});
