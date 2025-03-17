import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { createRewooWorkflow } from '.';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import { stupidStringCounter } from '@examples/tools/stupid-string-counter';
import inquirer from 'inquirer';
import { simpleDebug } from '../simple-debug';

const agent = createRewooWorkflow().compile('start');

const answer = await inquirer.prompt([
  {
    type: 'input',
    name: 'input',
    message: '\n\n🤖 질문 하세요',
    default: '124812*15125-35의 값과 strorrrberrry 에서 r 의 개수를 알려줄래?',
  },
]);
agent.subscribe(simpleDebug);

agent.run({
  userPrompt: answer.input,
  tools: [stupidCalculator, stupidSearchEngine, stupidStringCounter],
});
