import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { createReflectionAgent } from '.';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import inquirer from 'inquirer';
import { stupidStringCounter } from '@examples/tools/stupid-string-counter';
import { simpleDebug } from '../simple-debug';

const agent = createReflectionAgent().compile('input');

const answer = await inquirer.prompt([
  {
    type: 'input',
    name: 'input',
    message: '\n\n🤖 질문 하세요',
    default: '592 * 721 * 50 은 몇 입니까? 절대 틀리면 안됩니다.',
  },
]);

agent.subscribe(simpleDebug);

agent.run({
  userPrompt: answer.input,
  tools: [stupidCalculator, stupidSearchEngine, stupidStringCounter],
});
