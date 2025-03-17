import { GraphEvent } from 'ts-edge';

export const simpleDebug = (event: GraphEvent) => {
  switch (event.eventType) {
    case 'WORKFLOW_START':
      console.log(`\n\n\n✨ WORKFLOW_START\n\n\n`);
      break;
    case 'WORKFLOW_END':
      console.log(`\n\n\n✨ WORKFLOW_END\n\n\n`);
      break;
    case 'NODE_START':
      {
        const message = `-----NODE_START-----${event.node.name}-----`;
        console.log('\n\n\n' + message.padEnd(60, '-') + '\n');
      }
      break;
    case 'NODE_END':
      {
        const message = `--------------------`;
        console.log('\n' + message.padEnd(60, '-') + '\n\n\n');
      }
      break;
    case 'NODE_STREAM':
      if (typeof process !== 'undefined' && process.stdout && process.stdout.write) {
        process.stdout.write(' ' + event.node.chunk);
      } else {
        console.log('%c' + event.node.chunk, 'display:inline-block');
      }
      break;
  }
};
