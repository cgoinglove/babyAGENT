export const PromiseQueue = () => {
  let promise: Promise<any> = Promise.resolve();
  return <T>(asyncFunction: () => Promise<T>): Promise<T> => {
    const resultPromise = promise.then(() => asyncFunction());
    promise = resultPromise.catch(() => {});
    return resultPromise;
  };
};

export class LimitedTaskExecutor {
  private queues: Array<ReturnType<typeof PromiseQueue>>;
  private cursor = 0;

  constructor(concurrency: number) {
    this.queues = Array.from({ length: concurrency }).map(PromiseQueue);
  }
  runTask<T>(task: () => Promise<T>): Promise<T> {
    const queue = this.queues[this.cursor % this.queues.length]!;
    this.cursor++;
    return queue(task) as Promise<T>;
  }
}
