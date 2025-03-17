import inquirer from 'inquirer';
import { createSampleAgent } from '.';
import { simpleDebug } from '../simple-debug';

const agent = createSampleAgent().compile('start');

const prompt = await inquirer
  .prompt([
    {
      type: 'input',
      name: 'prompt',
      message: 'Enter your prompt',
    },
  ])
  .then((res) => res.prompt);
agent.subscribe(simpleDebug);
agent.run({
  userPrompt: prompt,
});
