import { createReactAgent, reactAgentLogger } from '@examples/agent/ReAct';
import { calculator } from '@examples/tools/calculator';
import { searchEngine } from '@examples/tools/search-engine';
import { suite, test } from 'vitest';

suite('agent', () => {
  test('reasoning and actiong', async () => {
    const agent = createReactAgent();

    agent.subscribe(reactAgentLogger);
    const response = await agent.run({
      prompt: '내 이름을 맞춰봐',
      tools: [calculator, searchEngine],
      limitTry: 3,
    });
    if (response.isOk) console.log(`result: ${response.output}`);
    else throw response.error;
  });
});
