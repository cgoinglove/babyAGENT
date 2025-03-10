import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { createReactAgent } from '.';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import inquirer from 'inquirer';

const agent = createReactAgent();

const answer = await inquirer.prompt([
  {
    type: 'input',
    name: 'input',
    message: '\n\n🤖 질문 하세요',
    default: '145*25+21 은 몇이야?',
  },
]);

agent.run({
  prompt: answer.input,
  tools: [stupidCalculator, stupidSearchEngine],
});
