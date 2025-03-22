import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { createReactAgent } from '.';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import inquirer from 'inquirer';
import { stupidStringCounter } from '@examples/tools/stupid-string-counter';
import { simpleDebug } from '../simple-debug';

const agent = createReactAgent().compile('🧠 reasoning');

const answer = await inquirer.prompt([
  {
    type: 'input',
    name: 'input',
    message: '\n\n🤖 질문 하세요',
    default: 'strorrrberrry 에서 r 은 몇개야?',
  },
]);
agent.subscribe(simpleDebug);
agent.run({
  userPrompt: answer.input,
  tools: [stupidCalculator, stupidSearchEngine, stupidStringCounter],
});
