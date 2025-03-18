import { createGraph, createStateGraph, graphStore } from 'ts-edge';
import { suite, test } from 'vitest';

suite('graph', () => {
  test('default graph', async () => {
    const graph = createGraph()
      .addNode({
        name: 'A',
        execute: (input: number) => {
          console.log('A');
          console.log('A input:', input);
          return input + 1000;
        },
      })
      .addNode({
        name: 'B',
        execute: (input: number) => {
          console.log('B');
          console.log('B input:', input);
          return input + 1000;
        },
      })
      .addNode({
        name: 'C',
        execute: (input: number) => {
          console.log('C');
          console.log('C input:', input);
          return input + 1000;
        },
      })
      .edge('A', 'B') // A가 종료되면 A의 return 값으로 B의 input 으로 B 실행
      .edge('B', 'C'); // B가 종료되면 B의 return 값으로 C의 input 으로 C 실행

    const app = graph.compile('A'); // 시작 노드 지정 하면서 app 생성

    const result = await app.run(1000); // 시작 노드인 A 의 input 값 type 인 1000 으로 실행
    // app.run('1000') // string 타입은 컴파일 에러 (타입에러)

    console.log('result:', result.output); //마지막 노드의 output
    // result 에는 history 등이 포함되어있음
  });

  test('graph type safe', async () => {
    const graph = createGraph()
      .addNode({
        name: 'string to number',
        execute: (input: string) => {
          return Number(input);
        },
      })
      .addNode({
        name: 'number to string',
        execute: (input: number) => {
          return String(input);
        },
      })
      .addNode({
        name: 'string to boolean',
        execute(input) {
          return Boolean(input);
        },
      })
      // string to number 노드의 output 이 number 이기 때문에
      // number to string 노드와 연결 가능
      .edge('string to number', 'number to string')
      // 👇🏻 아래 경우  number 타입이 string 이 아니기때문에 타입에러 발생
      // .edge('string to number', 'string to boolean')

      .edge('number to string', 'string to boolean');

    const app = graph.compile('string to number');
    const result = await app.run('1000');
    console.log('result:', result.output);
  });

  test('dynamic edge', async () => {
    const graph = createGraph()
      .addNode({
        name: 'START',
        execute: (input: number) => {
          console.log('START');
          console.log('START input:', input);
          return input > 1000 ? 'A' : 'B';
        },
      })
      .addNode({
        name: 'A NODE',
        execute: (input: string) => {
          console.log('A NODE');
          return 'A 노드 완료.';
        },
      })
      .addNode({
        name: 'B NODE',
        execute: (input: string) => {
          console.log('B NODE');
          return 'B 노드 완료.';
        },
      })
      .dynamicEdge('START', {
        // 이동 가능 노드 지정
        possibleTargets: ['A NODE', 'B NODE'],
        router: (startNodeOutput) => {
          // startNodeOutput 은 START 노드의 output 값

          // 조건에 따라 이동 가능 노드 지정
          return startNodeOutput === 'A' ? 'A NODE' : 'B NODE';
        },
      });

    const app = graph.compile('START');
    const result = await app.run(2000);
    console.log('result:', result.output);
  });

  test('state graph', async () => {
    // state graph 는 모든 노드가 동일한 상태를 공유하는 그래프
    // react Store 인 zustand 와 같은 형태로 구현 됨

    type CounterStore = {
      count: number;
      setCount: (count: number) => void;
      increment: () => void;
      decrement: () => void;
    };
    // store 생성
    const countStore = graphStore<CounterStore>((set) => {
      return {
        count: 0,
        setCount: (count) => set({ count }),
        increment: () => set((prev) => ({ count: prev.count + 1 })),
        decrement: () => set((prev) => ({ count: prev.count - 1 })),
      };
    });

    // store 를 사용하는 state graph 생성
    const graph = createStateGraph(countStore)
      .addNode({
        name: 'INCREMENT',
        execute: (store) => {
          console.log(`INCREMENT ${store.count}`);
          store.increment();
        },
      })
      .addNode({
        name: 'DECREMENT',
        execute: (store) => {
          console.log(`DECREMENT ${store.count}`);
          store.decrement();
        },
      })
      .addNode({
        name: 'LOG',
        execute: (store) => {
          console.log(`PRINT ${store.count}`);
        },
      })
      .edge('INCREMENT', 'LOG')
      .edge('DECREMENT', 'LOG');

    // INCREMENT 가 시작 노드인 APP
    const app1 = graph.compile('INCREMENT');
    const result1 = await app1.run();
    console.log('result1:', result1.output?.count);

    // DECREMENT 가 시작 노드인 APP
    const app2 = graph.compile('DECREMENT');
    const result2 = await app2.run();
    console.log('result2:', result2.output?.count);
  });
});
