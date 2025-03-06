export class Locker {
  private promise: Promise<void>;
  private resolve: () => void;

  constructor() {
    this.lock();
  }
  lock() {
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
  unLock() {
    this.resolve();
  }
  wait() {
    return this.promise;
  }
}
