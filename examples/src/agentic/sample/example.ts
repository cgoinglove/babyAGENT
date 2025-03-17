import inquirer from 'inquirer';
import { createSampleAgent } from '.';

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

agent.run({
  userPrompt: prompt,
  debug: true,
});
