import { createReactAgent } from '@examples/agent/01-re-act';
import { calculator } from '@examples/tools/calculator';
import { searchEngine } from '@examples/tools/search-engine';

import { test } from 'vitest';

test('reasoning and actiong', async () => {
  const agent = createReactAgent();

  agent.subscribe((e) => {
    if (e.eventType == 'NODE_END') {
      console.log(`\n\n✨ ${e.node.name}:`);
      switch (e.node.name) {
        case '🧠 reasoning':
          console.log(`생각: ${e.node.output?.thought}`);
          if (!e.node.output?.action.tool) console.log(`생각: 도구 필요 없다고 판단.`);
          break;
        case '🛠️ acting':
          console.log(`도구   : ${e.node.output?.action.tool}`);
          console.log(`input  : ${e.node.output?.action.input}`);
          console.log(`output : ${e.node.output?.action.output}`);
          break;
      }
    }
  });

  const response1 = await agent.run({
    prompt: '145*25+21 은 몇이야?',
    tools: [calculator, searchEngine],
  });
  if (response1.isOk) console.log(`최종답변 : ${response1.output}`);
  else throw response1.error;
});
