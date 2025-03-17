import { graphStateNode } from 'ts-edge';
import { RewooState } from '../state';

export const rewooStartNode = graphStateNode({
  name: 'start',
  execute: (state: RewooState, { stream }) => {
    stream(`USER PROMPT: ${state.userPrompt}\n`);
    const tools = state.tools.map((tool) => `${tool.name}: ${tool.description}`).join('\n');
    stream(`TOOLS: ${tools}\n`);
  },
});
