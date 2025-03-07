import { createGraph, GraphEvent } from 'ts-edge';
import { reasoningNode } from './node/reasoning';
import { actingNode } from './node/acting';
import { outputNode } from './node/output';
import { inputNode } from './node/input';
import { ReactState } from './state';
import chalk from 'chalk';

const workflow = createGraph()
  .addNode(inputNode)
  .addNode(reasoningNode)
  .addNode(actingNode)
  .addNode(outputNode)
  .edge('input', '🧠 reasoning')
  .dynamicEdge('🧠 reasoning', (nodeResult) => {
    const state = nodeResult.output;
    if (state.limitTry != undefined && --state.limitTry <= 0) return 'output';
    return state.observation == 'use_action' ? '🛠️ acting' : 'output';
  })
  .edge('🛠️ acting', '🧠 reasoning');

export const createReactAgent = () => workflow.compile('input', 'output');

export const reactAgentLogger = (event: GraphEvent) => {
  if (event.eventType == 'WORKFLOW_END' || event.eventType == 'WORKFLOW_START' || event.eventType == 'NODE_START')
    return;
  if (!event.isOk) return;
  const state = event.node.output as ReactState;
  switch (event.node.name) {
    case '🧠 reasoning':
      console.log(chalk.blue.bold(`\n🧠 REASONING -------------------`));
      console.log(chalk.cyan(`계획: ${state.thought.slice(0, 300)}${state.thought.length > 300 ? '...' : ''}`));
      if (state.observation === 'use_action') {
        console.log(chalk.green(`결정: "${state.action.tool}" 도구 사용하기`));
      } else if (state.observation === 'complete') {
        console.log(chalk.magenta(`결정: 최종 답변 제공하기`));
      }
      break;

    case '🛠️ acting':
      console.log(chalk.green.bold(`\n🛠️ ACTION -------------------`));
      console.log(chalk.yellow(`도구: ${state.action.tool}`));
      console.log(chalk.yellow(`입력: ${state.action.input}`));
      console.log(
        chalk.cyan(
          `결과: ${state.action.output?.substring(0, 150)}${state.action.output && state.action.output.length > 150 ? '...' : ''}`
        )
      );
      break;
  }
};
