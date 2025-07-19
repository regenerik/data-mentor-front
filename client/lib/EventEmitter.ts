export class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(...args));
    }
  }

  removeListener(event: string, listener: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l !== listener);
    }
  }

  addChangeListener(callback: () => void): void {
    this.on("change", callback);
  }

  removeChangeListener(callback: () => void): void {
    this.removeListener("change", callback);
  }
}
