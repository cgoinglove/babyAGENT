import inquirer from 'inquirer';
import { createYoutubeReportAgent } from '.';
import { simpleDebug } from '../simple-debug';

const agent = createYoutubeReportAgent().compile('analysis');

const answer = await inquirer.prompt([
  {
    type: 'input',
    name: 'input',
    message: '\n\n🤖 질문 하세요',
    default: 'https://www.youtube.com/watch?v=9GsV4PE1v7I 요약 해줘',
  },
]);
agent.subscribe(simpleDebug);

agent
  .run({
    userPrompt: answer.input,
  })
  .then((res) => {
    if (res.isOk) {
      console.dir(res.output, { depth: null });
    } else {
      console.log(res.error);
    }
  });
