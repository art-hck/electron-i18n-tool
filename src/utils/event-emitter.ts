type Callback = (payload?: unknown) => unknown;

export const eventEmitter = new class {
  listners: Record<string, Callback[]> = {};

  on(eventName: string, callback: Callback) {
    (this.listners[eventName] || (this.listners[eventName] = [])).push(callback)
  }

  emit(eventName: string, payload?: unknown) {
    this.listners[eventName]?.forEach(listner => {
      listner(payload);
    });
  }
};